import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

interface SubscriptionMap {
  [id: string]: Stomp.Subscription;
}

let stompClient: Stomp.Client | null = null;
let isConnected = false;
let isConnecting = false;
let subscriptions: SubscriptionMap = {};
const onConnectQueue: Array<() => void> = []; // 연결 성공 후 실행할 콜백 큐

const WebSocketManager = {
  // 1. 서버 연결
  connect: function (url: string, onConnectCallback?: () => void) {
    // 이미 연결되어 있다면 콜백 실행 후 종료
    if (isConnected && stompClient?.connected) {
      if (onConnectCallback) onConnectCallback();
      return;
    }

    // 연결 중이면 콜백을 큐에 담고 종료
    if (isConnecting) {
      if (onConnectCallback) {
        console.log(
          '[WebSocket - 구독 대기] Connection in progress, queuing callback...',
        );
        onConnectQueue.push(onConnectCallback);
      }
      return;
    }

    isConnecting = true; // 연결 시작
    if (onConnectCallback) onConnectQueue.push(onConnectCallback);

    const socket = new SockJS(url);
    stompClient = Stomp.over(socket);
    stompClient.debug = () => {};

    stompClient.connect(
      {},
      (frame) => {
        isConnected = true;
        isConnecting = false; // 연결 완료
        console.log('[WebSocket - 연결 성공]: ' + frame);

        // 큐에 쌓여있던 구독 요청들 처리
        while (onConnectQueue.length > 0) {
          const callback = onConnectQueue.shift()!;
          callback?.();
        }

        if (onConnectCallback) onConnectCallback();
      },
      (error) => {
        console.error('[WebSocket - 연결 실패]: ' + error);
        isConnected = false;
        isConnecting = false; // 연결 실패
      },
    );
  },

  // 2. 구독 신청
  subscribe: function (
    id: string,
    topic: string,
    callback: (data: any) => void,
  ) {
    if (!stompClient || !isConnected) {
      console.error(`[WebSocket - 구독 실패] ${topic} (id: ${id})`);
      return;
    }

    this.unsubscribe(id); // 중복 구독 방지

    const subscription = stompClient.subscribe(topic, (response) => {
      const data = JSON.parse(response.body);
      callback(data);
    });

    subscriptions[id] = subscription;
    console.log(`[WebSocket - 구독] ${topic} (id: ${id})`);
  },

  // 3. 특정 채널 구독 해제
  unsubscribe: function (id: string) {
    if (subscriptions[id]) {
      subscriptions[id].unsubscribe();
      delete subscriptions[id];
      console.log(`[WebSocket - 구독 해제] ${id}`);
    }
  },

  // 4. 모든 구독 해제
  unsubscribeAll: function () {
    Object.keys(subscriptions).forEach((id) => {
      this.unsubscribe(id);
    });
  },

  // 5. 연결 여부 확인
  checkConnection: function () {
    return isConnected && stompClient?.connected;
  },

  // 6. 연결 완전히 끊기
  disconnect: function () {
    if (stompClient) {
      stompClient.disconnect(() => {
        isConnected = false;
        subscriptions = {};
        console.log('[WebSocket - 연결 종료]');
      });
    }
  },
};

export default WebSocketManager;

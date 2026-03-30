import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

interface SubscriptionMap {
  [id: string]: Stomp.Subscription;
}

let stompClient: Stomp.Client | null = null;
let isConnected = false;
let subscriptions: SubscriptionMap = {};

const WebSocketManager = {
    // 1. 서버 연결
    connect: function (url: string, onConnectCallback?: () => void) {
      if (isConnected && stompClient?.connected) {
        if (onConnectCallback) onConnectCallback();
        return;
      }

      const socket = new SockJS(url);
      stompClient = Stomp.over(socket);

      stompClient.debug = () => {};

      stompClient.connect(
        {},
        (frame) => {
          isConnected = true;
          console.log('WebSocket Connected: ' + frame);
          if (onConnectCallback) onConnectCallback();
        },
        (error) => {
          console.error('STOMP Error: ' + error);
          isConnected = false;
        }
      );
    },

    // 2. 구독 신청
    subscribe: function (id: string, topic: string, callback: (data: any) => void) {
      if (!stompClient || !isConnected) {
        console.warn('연결이 활성화되지 않았습니다.');
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
          console.log("Disconnected");
        });
      }
    }
};

export default WebSocketManager;

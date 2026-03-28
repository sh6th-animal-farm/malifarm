import { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Toggle from "@/components/common/Toggle";
import PageHeader from "@/pages/mypage/components/PageHeader";
import { myPageApi } from "@/api/myPageApi";
import type { ProfileDTO } from "@/types/myPageType";
import AddressModal from "./AddressModal";
import PasswordModal from "./PasswordModal";

const notificationItems = [
  {
    key: "push",
    title: "푸시 알림 동의",
    description: "투자 상품 오픈, 이벤트 및 서비스 혜택 알림을 실시간으로 받습니다.",
  },
  {
    key: "email",
    title: "이메일 수신 동의",
    description: "자산 리포트 및 주요 뉴스레터를 이메일로 받아보실 수 있습니다.",
  },
] as const;

export default function ProfileLayout() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressDraft, setAddressDraft] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await myPageApi.getProfile();
        setProfile(data);
        setPushEnabled(Boolean(data?.pushYn));
        setEmailEnabled(Boolean(data?.receiveEmailYn));
      } catch (error) {
        console.error("내 정보 조회 실패", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const profileItems = useMemo(
    () => {
      const address = profile?.address?.trim() ? profile.address : "-";

      return [
        { label: "이메일", value: profile?.email ?? "-" },
        { label: "휴대폰 번호", value: profile?.phoneNumber ?? "-" },
        { label: "주소", value: address, editable: true },
        { label: "비밀번호", value: "••••••••", editable: true },
      ];
    },
    [profile],
  );

  const notificationState = {
    push: pushEnabled,
    email: emailEnabled,
  } as const;

  const updateNotification = async (key: "push" | "email", checked: boolean) => {
    if (!profile) return;

    const previousPush = pushEnabled;
    const previousEmail = emailEnabled;

    if (key === "push") setPushEnabled(checked);
    if (key === "email") setEmailEnabled(checked);

    try {
      await myPageApi.updateProfile({
        address: profile.address ?? "",
        pushYn: key === "push" ? checked : pushEnabled,
        receiveEmailYn: key === "email" ? checked : emailEnabled,
      });
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              pushYn: key === "push" ? checked : prev.pushYn,
              receiveEmailYn: key === "email" ? checked : prev.receiveEmailYn,
            }
          : prev,
      );
    } catch (error) {
      console.error("알림 설정 변경 실패", error);
      setPushEnabled(previousPush);
      setEmailEnabled(previousEmail);
    }
  };

  const openAddressModal = () => {
    setAddressDraft(profile?.address ?? "");
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    if (savingAddress) return;
    setIsAddressModalOpen(false);
  };

  const saveAddress = async () => {
    if (!profile || savingAddress) return;

    try {
      setSavingAddress(true);
      await myPageApi.updateProfile({
        address: addressDraft,
        pushYn: pushEnabled,
        receiveEmailYn: emailEnabled,
      });
      setProfile((prev) => (prev ? { ...prev, address: addressDraft } : prev));
      setIsAddressModalOpen(false);
    } catch (error) {
      console.error("주소 수정 실패", error);
    } finally {
      setSavingAddress(false);
    }
  };

  const openPasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    if (changingPassword) return;
    setIsPasswordModalOpen(false);
  };

  const changePassword = async () => {
    if (changingPassword) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("비밀번호를 모두 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setChangingPassword(true);
      await myPageApi.updatePassword({
        currentPassword,
        newPassword,
      });
      setIsPasswordModalOpen(false);
    } catch (error) {
      console.error("비밀번호 변경 실패", error);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="내 정보"
        subtitle="마리팜에서 사용되는 회원님의 정보를 관리합니다."
      />

      <div className="space-y-4 md:space-y-5">
        <section className="rounded-lg bg-white p-4 shadow-std md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <strong className="font-header-03 text-gray-900">
              {loading ? "불러오는 중..." : profile?.userName ?? "-"}
            </strong>
            <Badge variant="info" width="auto" height={28} className="cursor-default select-none rounded-full">
              {profile?.investorType ?? "General Investor"}
            </Badge>
          </div>
          <p className="mt-2 font-caption-01 text-gray-500">
            가입일: {profile?.createdAt ? profile.createdAt.slice(0, 10) : "-"}
          </p>
        </section>

        <section className="overflow-hidden rounded-lg bg-white shadow-std">
          <h2 className="px-4 pt-4 font-subtitle-01 text-gray-900 md:px-6 md:pt-6">
            기본 정보
          </h2>
          <div className="pb-4 pt-3 md:px-0 md:pb-6 md:pt-4">
            {profileItems.map((item) => (
              <div
                key={item.label}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-gray-50 md:px-6"
              >
                <div>
                  <p className="font-caption-02 text-gray-400">{item.label}</p>
                  <p className="mt-1.5 font-body-02 text-gray-900">{item.value}</p>
                </div>
                {item.editable ? (
                  <Button
                    type="button"
                    variant="subscriptionEnd"
                    width={52}
                    height={32}
                    className="font-caption-02 hover:bg-gray-200"
                    onClick={
                      item.label === "주소"
                        ? openAddressModal
                        : item.label === "비밀번호"
                          ? openPasswordModal
                          : undefined
                    }
                  >
                    수정
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg bg-white shadow-std">
          <h2 className="px-4 pt-4 font-subtitle-01 text-gray-900 md:px-6 md:pt-6">
            알림 및 수신 설정
          </h2>
          <div className="pb-4 pt-3 md:px-0 md:pb-6 md:pt-4">
            {notificationItems.map((item) => (
              <div
                key={item.key}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-gray-50 md:px-6"
              >
                <div className="pr-3">
                  <p className="font-body-02 text-gray-900">{item.title}</p>
                  <p className="mt-1.5 font-caption-01 text-gray-400">{item.description}</p>
                </div>
                <Toggle
                  checked={notificationState[item.key]}
                  onChange={(checked) => updateNotification(item.key, checked)}
                  className="mt-0.5"
                  ariaLabel={item.title}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-dashed border-gray-200 p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-caption-02 text-gray-900">계정 삭제가 필요하신가요?</p>
              <p className="mt-1 font-caption-01 text-gray-400">
                회원 탈퇴 시 모든 투자 기록 및 자산 정보가 삭제되며 복구할 수 없습니다.
              </p>
            </div>
            <button
              type="button"
              className="self-start cursor-pointer bg-transparent font-caption-02 font-bold text-gray-400 underline hover:text-gray-500"
            >
              회원 탈퇴
            </button>
          </div>
        </section>
      </div>

      <AddressModal
        isOpen={isAddressModalOpen}
        addressDraft={addressDraft}
        savingAddress={savingAddress}
        onChangeAddress={setAddressDraft}
        onClose={closeAddressModal}
        onSave={saveAddress}
      />

      <PasswordModal
        isOpen={isPasswordModalOpen}
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        changingPassword={changingPassword}
        onChangeCurrentPassword={setCurrentPassword}
        onChangeNewPassword={setNewPassword}
        onChangeConfirmPassword={setConfirmPassword}
        onClose={closePasswordModal}
        onSubmit={changePassword}
      />
    </div>
  );
}

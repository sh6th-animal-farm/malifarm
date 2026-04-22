export type PasswordValidationResult = {
  isValid: boolean;
  message: string;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  combinationCount: number;
};

export function validatePassword(password: string): PasswordValidationResult {
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const combinationCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;

  if (combinationCount < 2) {
    return {
      isValid: false,
      message:
        "비밀번호는 영문, 숫자, 특수문자 중 2종류 이상을 조합해야 합니다.",
      hasLetter,
      hasNumber,
      hasSpecial,
      combinationCount,
    };
  }

  if (combinationCount === 2 && password.length < 10) {
    return {
      isValid: false,
      message:
        "비밀번호는 영문, 숫자, 특수문자 중 2종류 조합 시 10자 이상이어야 합니다.",
      hasLetter,
      hasNumber,
      hasSpecial,
      combinationCount,
    };
  }

  if (combinationCount >= 3 && password.length < 8) {
    return {
      isValid: false,
      message:
        "비밀번호는 영문, 숫자, 특수문자 중 3종류 이상 조합 시 8자 이상이어야 합니다.",
      hasLetter,
      hasNumber,
      hasSpecial,
      combinationCount,
    };
  }

  return {
    isValid: true,
    message: "사용 가능한 비밀번호입니다.",
    hasLetter,
    hasNumber,
    hasSpecial,
    combinationCount,
  };
}
export class PaymentBuyerInfoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentBuyerInfoError";
  }
}

export type PaymentBuyerIyzicoContext = {
  isSandbox: boolean;
  sandboxDefaultIdentity: string;
};

/** Türkiye cep numarasını İyzico formatına (+905XXXXXXXXX) çevirir. */
export function normalizeTurkishPhone(phone: string | null | undefined): string {
  if (!phone?.trim()) {
    throw new PaymentBuyerInfoError(
      "Ödeme için profilinizde geçerli bir telefon numarası olmalıdır.",
    );
  }

  const digits = phone.replace(/\D/g, "");
  let national: string;

  if (digits.startsWith("90") && digits.length === 12) {
    national = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length === 11) {
    national = digits.slice(1);
  } else if (digits.length === 10) {
    national = digits;
  } else {
    throw new PaymentBuyerInfoError(
      "Geçerli bir Türkiye cep telefonu numarası girin (ör. 0532 XXX XX XX).",
    );
  }

  if (!/^5[0-9]{9}$/.test(national)) {
    throw new PaymentBuyerInfoError(
      "Geçerli bir Türkiye cep telefonu numarası girin.",
    );
  }

  return `+90${national}`;
}

export function isValidTurkishIdentityNumber(value: string): boolean {
  if (!/^[1-9][0-9]{10}$/.test(value)) return false;

  const digits = value.split("").map(Number);
  const sumOdd =
    digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sumEven = digits[1] + digits[3] + digits[5] + digits[7];
  const digit10 = (sumOdd * 7 - sumEven) % 10;
  if (digit10 !== digits[9]) return false;

  const sumFirst10 = digits.slice(0, 10).reduce((acc, d) => acc + d, 0);
  return sumFirst10 % 10 === digits[10];
}

function isSandboxTestIdentity(value: string): boolean {
  return /^[1-9][0-9]{10}$/.test(value);
}

/** TC kimlik numarasını doğrular; sandbox ortamında env varsayılanı kullanılabilir. */
export function normalizeTurkishIdentityNumber(
  identity: string | null | undefined,
  options?: {
    allowSandboxDefault?: boolean;
    sandboxDefaultIdentity?: string;
  },
): string {
  const trimmed = identity?.replace(/\D/g, "") ?? "";

  if (trimmed.length === 11) {
    if (isValidTurkishIdentityNumber(trimmed)) return trimmed;
    throw new PaymentBuyerInfoError("Geçerli bir TC kimlik numarası girin.");
  }

  if (options?.allowSandboxDefault) {
    const fallback =
      options.sandboxDefaultIdentity?.replace(/\D/g, "") ?? "";
    if (fallback.length === 11 && isSandboxTestIdentity(fallback)) {
      return fallback;
    }
  }

  throw new PaymentBuyerInfoError(
    identity?.trim()
      ? "Geçerli bir TC kimlik numarası girin."
      : "Ödeme için TC kimlik numaranız gereklidir.",
  );
}

export function resolvePaymentBuyerInfo(input: {
  phone: string | null | undefined;
  identityNumber?: string | null | undefined;
  iyzico: PaymentBuyerIyzicoContext;
}) {
  const hasIdentity = Boolean(input.identityNumber?.trim());

  return {
    gsmNumber: normalizeTurkishPhone(input.phone),
    identityNumber: normalizeTurkishIdentityNumber(input.identityNumber, {
      allowSandboxDefault: input.iyzico.isSandbox && !hasIdentity,
      sandboxDefaultIdentity: input.iyzico.sandboxDefaultIdentity,
    }),
  };
}

export const disputeEventLabels: Record<string, string> = {
  CUSTOMER_OPENED: "İtiraz açıldı",
  PROVIDER_MESSAGE: "Usta mesajı",
  PROVIDER_RESUBMITTED: "Düzeltme gönderildi",
  CUSTOMER_ACCEPTED: "Müşteri onayladı",
  CUSTOMER_REJECTED: "Müşteri reddetti",
  ADMIN_RESOLVED: "Admin çözümü",
  ADMIN_REJECTED: "Admin reddi",
};

export const disputePhaseLabels: Record<string, string> = {
  AWAITING_PROVIDER: "Usta yanıtı bekleniyor",
  AWAITING_CUSTOMER: "Müşteri onayı bekleniyor",
  CLOSED: "Kapalı",
};

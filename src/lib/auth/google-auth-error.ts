export class GoogleAuthError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "account_inactive"
      | "provider_suspended"
      | "need_register"
      | "invalid_profile",
  ) {
    super(message);
    this.name = "GoogleAuthError";
  }
}

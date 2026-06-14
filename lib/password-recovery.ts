export const PASSWORD_RECOVERY_COOKIE = "futura_password_recovery"

export const PASSWORD_RECOVERY_MAX_AGE_SECONDS = 15 * 60

export const passwordRecoveryCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
}

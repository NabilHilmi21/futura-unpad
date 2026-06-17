import { NextResponse } from "next/server";
import { invalidRequest, rateLimited } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const limit = await rateLimit(request, {
    key: "auth-forgot-password",
    limit: 4,
    windowSeconds: 300,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const parsed = forgotPasswordSchema.safeParse(
    await request.json().catch(() => null)
  );

  if (!parsed.success) {
    return invalidRequest();
  }

  const requestUrl = new URL(request.url);
  const redirectUrl = new URL(
    "/auth/callback",
    process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin
  );
  redirectUrl.searchParams.set("next", "/reset-password");

  const { createAdminClient } = await import("@/utils/supabase/server");
  const adminSupabase = createAdminClient();

  // 1. Check if user exists (throws 'user_not_found' if not)
  const { error: generateError } = await adminSupabase.auth.admin.generateLink({
    type: "recovery",
    email: parsed.data.email,
    options: {
      redirectTo: redirectUrl.toString(),
    },
  });

  if (generateError) {
    return NextResponse.json({ error: generateError.message }, { status: 400 });
  }

  // 2. Actually send the email (which generates the latest, valid token)
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: redirectUrl.toString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

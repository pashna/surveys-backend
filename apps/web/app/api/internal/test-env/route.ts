import { env } from "@formbricks/lib/env";

const ENV = env;
export async function GET() {
  return Response.json({
    NEXT_PUBLIC_SENTRY_DSN: ENV.NEXT_PUBLIC_SENTRY_DSN,
    SIGNUP_RATE_LIMIT_INTERVAL: ENV.SIGNUP_RATE_LIMIT_INTERVAL,
  });
}

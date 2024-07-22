import { z } from "zod";

export const ZMobileSDKUser = z.object({
  id: z.string().optional(),
  attributes: z.record(z.string(), z.string()),
});

export const ZMobileSDKUserAction = z.object({
  action: z.string(),
  user: ZMobileSDKUser,
});

export type TMobileSDKUser = z.infer<typeof ZMobileSDKUser>;

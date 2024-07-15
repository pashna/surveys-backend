import { z } from "zod";

export const ZMobileSDKUser = z.object({
  user: z.object({
    id: z.string().optional(),
    attributes: z.record(z.string(), z.string()),
  }),
});

export type TMobileSDKUser = z.infer<typeof ZMobileSDKUser>;

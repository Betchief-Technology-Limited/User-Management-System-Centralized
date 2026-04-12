import { z } from "zod";
import { USER_STATUS } from "../../shared/constants/system";

export const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImage: z.string().optional(),
  phoneNumber: z.string().optional(),
  metadata: z.object({}).catchall(z.any()).optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.enum([
    USER_STATUS.ACTIVE,
    USER_STATUS.INACTIVE,
    USER_STATUS.SUSPENDED
  ]),
});


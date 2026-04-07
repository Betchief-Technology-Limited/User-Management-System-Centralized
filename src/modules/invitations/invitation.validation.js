import { z } from "zod";

export const createInvitationSchema = z.object({
    email: z.string().email(),
    roleId: z.string().min(1)
});

export const acceptInvitationSchema = z.object({
    token: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    password: z.string().min(8)
});

export const previewInvitationSchema = z.object({
    token: z.string().min(1)
})
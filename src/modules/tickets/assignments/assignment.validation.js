import { z } from "zod";

export const assignTicketSchema = z.object({
    assignedToUserId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Assigned user identitifier must be a valid MongoDB user id")
})
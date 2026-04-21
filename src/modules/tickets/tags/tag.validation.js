import { z } from "zod";

export const createTicketTagSchema = z.object({
    name: z.string().min(1, "Tag name is required")
});

export const removeTicketTagParamSchema = z.object({
    ticketId: z.string().min(1, "Ticket identifier is required"),
    tagId: z.string().uuid("Tag identifier must be a valid UUID")
});
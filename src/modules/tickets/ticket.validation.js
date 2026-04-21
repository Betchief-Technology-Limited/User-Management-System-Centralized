import { z } from "zod";
import {
    DEFAULT_TICKET_LIMIT,
    DEFAULT_TICKET_PAGE,
    MAX_TICKET_LIMIT,
    TICKET_STATUS
} from "./ticket.constants.js";

const ticketStatusValues = Object.values(TICKET_STATUS);

export const ticketIdParamSchema = z.object({
    ticketId: z.string().min(1, "Ticket identifier is required")
});

export const createTicketSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required")
});

export const listTicketsQuerySchema = z.object({
    status: z.enum(ticketStatusValues).optional(),
    assignedToUserId: z.string().min(1).optional(),
    page: z.coerce.number().int().min(1).default(DEFAULT_TICKET_PAGE),
    limit: z.coerce.number().int().min(1).max(MAX_TICKET_LIMIT).default(DEFAULT_TICKET_LIMIT)
});
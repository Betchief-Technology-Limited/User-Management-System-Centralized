import { AppError } from "../../shared/errors/AppError.js";
import { createTicketWithStatusHistory, countTickets, findTicketByPublicId, listTickets, ticketIdExists } from "./ticket.repository.js";
import { TICKET_PRIORITY, TICKET_STATUS } from "./ticket.constants.js";
import { buildPaginationMeta, getPagination } from "./ticket.utils.js";
import { generateUniqueTicketId } from "./helpers/ticket-id-generator.js";
import { buildTicketFilters } from "./helpers/build-ticket-filters.js";
import { toCreateTicketDto } from "./dto/create-ticket.dto.js";
import { toListTicketsDto } from "./dto/list-ticket.dto.js";
import { toTicketDetailDto } from "./dto/ticket-detail.dto.js";

export async function createTicket(data, actor) {
    const ticketId = await generateUniqueTicketId(ticketIdExists);

    const ticket = await createTicketWithStatusHistory({
        ticketData: {
            ticketId,
            title: data.title.trim(),
            description: data.description.trim(),
            status: TICKET_STATUS.OPEN,
            priority: data.priority || TICKET_PRIORITY.MEDIUM,
            createdByUserId: actor.userId,
            createdByName: actor.name,
            createdByEmail: actor.email,
            updatedByUserId: actor.userId,
            updatedByName: actor.name,
            updatedByEmail: actor.email
        },
        statusHistoryData: {
            oldStatus: null,
            newStatus: TICKET_STATUS.OPEN,
            changedByUserId: actor.userId,
            changedByName: actor.name,
            changedByEmail: actor.email
        }
    });

    return toCreateTicketDto(ticket);
}

export async function getTickets(query = {}) {
    const pagination = getPagination(query);
    const where = buildTicketFilters(query);

    const [tickets, total] = await Promise.all([
        listTickets({
            where,
            skip: pagination.skip,
            take: pagination.limit,
            orderBy: {
                createdAt: "desc"
            }
        }),
        countTickets(where)
    ]);

    return {
        tickets: toListTicketsDto(tickets),
        meta: buildPaginationMeta({
            page: pagination.page,
            limit: pagination.limit,
            total
        })
    };
}

export async function getTicketDetail(ticketId) {
    const ticket = await findTicketByPublicId(ticketId, {
        includeMessages: true
    });

    if (!ticket) {
        throw new AppError("Ticket not found", 404);
    }

    return toTicketDetailDto(ticket);
}

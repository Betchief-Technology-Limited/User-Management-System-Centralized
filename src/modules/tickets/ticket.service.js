import { AppError } from "../../shared/errors/AppError.js";
import { createTicketWithTimeline, countTickets, findTicketByPublicId, listTickets, ticketIdExists } from "./ticket.repository.js";
import { TICKET_PRIORITY, TICKET_STATUS } from "./ticket.constants.js";
import { buildPaginationMeta, getPagination } from "./ticket.utils.js";
import { generateUniqueTicketId } from "./helpers/ticket-id-generator.js";
import { buildTicketFilters } from "./helpers/build-ticket-filters.js";
import { resolveCustomerIdentity } from "./helpers/resolve-customer-identity.js";
import { getAssignableUserSnapshot } from "./helpers/ticket-assignee.js";
import { buildTicketEventPayload } from "./timeline/timeline.service.js";
import { toCreateTicketDto } from "./dto/create-ticket.dto.js";
import { toListTicketsDto } from "./dto/list-ticket.dto.js";
import { toTicketDetailDto } from "./dto/ticket-detail.dto.js";

export async function createTicket(data, actor) {
    const ticketId = await generateUniqueTicketId(ticketIdExists);
    const customer = await resolveCustomerIdentity({
        customerEmail: data.customerEmail || data.email?.fromEmail,
        customerPhone: data.customerPhone,
        customerName: data.customerName
    });
    const assignmentSnapshot = data.assignedToUserId
        ? await getAssignableUserSnapshot(data.assignedToUserId)
        : null;

    const ticket = await createTicketWithTimeline({
        ticketData: {
            ticketId,
            title: data.title.trim(),
            description: data.description.trim(),
            status: TICKET_STATUS.OPEN,
            priority: data.priority || TICKET_PRIORITY.MEDIUM,
            customerId: customer.customerId,
            customerName: customer.customerName,
            customerEmail: customer.customerEmail,
            customerPhone: customer.customerPhone,
            assignedToUserId: assignmentSnapshot?.userId,
            assignedToName: assignmentSnapshot?.name,
            assignedToEmail: assignmentSnapshot?.email,
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
        },
        assignmentHistoryData: assignmentSnapshot
            ? {
                previousAssignedToUserId: null,
                previousAssignedToName: null,
                previousAssignedToEmail: null,
                newAssignedToUserId: assignmentSnapshot.userId,
                newAssignedToName: assignmentSnapshot.name,
                newAssignedToEmail: assignmentSnapshot.email,
                assignedByUserId: actor.userId,
                assignedByName: actor.name,
                assignedByEmail: actor.email
            }
            : null,
        initialEvent: buildTicketEventPayload(
            {
                ...data,
                chat: {
                    ...(data.chat || {}),
                    message: data.chat?.message || data.description.trim()
                },
                email: {
                    ...(data.email || {}),
                    subject: data.email?.subject || data.title.trim(),
                    body: data.email?.body || data.description.trim()
                }
            },
            actor,
            customer
        )
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

import successResponse from "../../shared/utils/apiResponse.js";
import { buildActorSnapshotFromRequest } from "./ticket.utils.js";
import { createTicket, getTicketDetail, getTickets } from "./ticket.service.js";

export async function createTicketHandler(req, res) {
    const ticket = await createTicket(
        req.validatedBody,
        buildActorSnapshotFromRequest(req)
    );

    return successResponse(res, "Ticket created successfully", { ticket }, 201);
}

export async function listTicketsHandler(req, res) {
    const result = await getTickets(req.validatedQuery);

    return successResponse(
        res,
        "Tickets fetched successfully",
        { tickets: result.tickets },
        200,
        result.meta
    );
}

export async function getTicketDetailHandler(req, res) {
    const ticket = await getTicketDetail(req.validatedParams.ticketId);

    return successResponse(res, "Ticket fetched successfully", { ticket });
}
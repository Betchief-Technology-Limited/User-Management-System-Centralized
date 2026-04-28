import successResponse from "../../../shared/utils/apiResponse.js";
import { assignTicket } from "./assignment.service.js";
import { buildActorSnapshotFromRequest } from "../ticket.utils.js";

export async function assignTicketHandler(req, res) {
    const ticket = await assignTicket(
        req.validatedParams.ticketId,
        req.validatedBody.assignedToUserId,
        buildActorSnapshotFromRequest(req)
    );
    return successResponse(res, "Ticket assigned successfully", { ticket });
}

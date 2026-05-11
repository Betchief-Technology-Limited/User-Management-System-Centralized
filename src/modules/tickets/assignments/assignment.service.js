import { AppError } from "../../../shared/errors/AppError.js";
import { updateTicketAssignmentWithHistory, findTicketByPublicId } from "../ticket.repository.js";
import { mapTicketResponse } from "../helpers/map-ticket-response.js";
import { getAssignableUserSnapshot } from "../helpers/ticket-assignee.js";

export async function assignTicket(ticketId, assignedToUserId, actor) {
    const ticket = await findTicketByPublicId(ticketId);

    if (!ticket) {
        throw new AppError("Ticket not found", 404);
    }

    if (ticket.assignedToUserId === assignedToUserId) {
        throw new AppError("Ticket is already assigned to this user", 409);
    }

    const assignmentSnapshot = await getAssignableUserSnapshot(assignedToUserId);
    const updatedTicket = await updateTicketAssignmentWithHistory({
        ticketRefId: ticket.id,
        assignment: assignmentSnapshot,
        updatedBy: actor,
        history: {
            previousAssignedToUserId: ticket.assignedToUserId,
            previousAssignedToName: ticket.assignedToName,
            previousAssignedToEmail: ticket.assignedToEmail,
            newAssignedToUserId: assignmentSnapshot.userId,
            newAssignedToName: assignmentSnapshot.name,
            newAssignedToEmail: assignmentSnapshot.email,
            assignedByUserId: actor.userId,
            assignedByName: actor.name,
            assignedByEmail: actor.email
        }
    });

    return mapTicketResponse(updatedTicket);
}

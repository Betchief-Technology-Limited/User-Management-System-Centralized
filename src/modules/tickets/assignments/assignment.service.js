import { AppError } from "../../../shared/errors/AppError.js";
import { getUserById } from "../../users/user.service.js";
import { USER_STATUS } from "../../../shared/constants/system.js";
import { updateTicketAssignmentWithHistory, findTicketByPublicId } from "../ticket.repository.js";
import { buildUserSnapshot } from "../ticket.utils.js";
import { mapTicketResponse } from "../helpers/map-ticket-response.js";

export async function assignTicket(ticketId, assignedToUserId, actor) {
    const ticket = await findTicketByPublicId(ticketId);

    if (!ticket) {
        throw new AppError("Ticket not found", 404);
    }

    const assignedUser = await getUserById(assignedToUserId);

    if (assignedUser.status !== USER_STATUS.ACTIVE) {
        throw new AppError("Only active users can be assigned to tickets", 400);
    }

    if (ticket.assignedToUserId === assignedToUserId) {
        throw new AppError("Ticket is already assigned to this user", 409);
    }

    const assignmentSnapshot = buildUserSnapshot(assignedUser);
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
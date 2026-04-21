import { AppError } from "../../../shared/errors/AppError.js";
import {
    addTagToTicket,
    createTicketTag,
    findTicketByPublicId,
    findTicketTagById,
    findTicketTagByName,
    findTicketTagMapping,
    removeTagFromTicket
} from "../ticket.repository.js";
import { normalizeTagName } from "../ticket.utils.js";
import { mapTagResponse, mapTicketResponse } from "../helpers/map-ticket-response.js";

export async function addTicketTag(ticketId, tagName) {
    const ticket = await findTicketByPublicId(ticketId);

    if (!ticket) {
        throw new AppError("Ticket not found", 404);
    }

    const normalizedTagName = normalizeTagName(tagName);
    let tag = await findTicketTagByName(normalizedTagName);

    if (!tag) {
        tag = await createTicketTag(normalizedTagName);
    }

    const existingMapping = await findTicketTagMapping(ticket.id, tag.id);

    if (existingMapping) {
        throw new AppError("Tag is already attached to this ticket", 409);
    }

    await addTagToTicket(ticket.id, tag.id);

    const updatedTicket = await findTicketByPublicId(ticketId);

    return {
        ticket: mapTicketResponse(updatedTicket),
        tag: mapTagResponse(tag)
    };
}

export async function removeTicketTag(ticketId, tagId) {
    const [ticket, tag] = await Promise.all([
        findTicketByPublicId(ticketId),
        findTicketTagById(tagId)
    ]);

    if (!ticket) {
        throw new AppError("Ticket not found", 404);
    }

    if (!tag) {
        throw new AppError("Tag not found", 404);
    }

    const deleteResult = await removeTagFromTicket(ticket.id, tagId);

    if (deleteResult.count === 0) {
        throw new AppError("Tag is not attached to this ticket", 404);
    }

    const updatedTicket = await findTicketByPublicId(ticketId);

    return {
        ticket: mapTicketResponse(updatedTicket),
        tag: mapTagResponse(tag)
    };
}
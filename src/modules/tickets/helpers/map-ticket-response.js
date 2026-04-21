function mapUserReference(userId, name, email) {
    if (!userId) {
        return null;
    }

    return {
        userId,
        name,
        email
    };
}

export function mapTagResponse(tagMap) {
    const tag = tagMap.tag || tagMap;

    return {
        id: tag.id,
        name: tag.name,
        createdAt: tagMap.createdAt || tag.createdAt
    };
}

export function mapTicketResponse(ticket) {
    return {
        id: ticket.id,
        ticketId: ticket.ticketId,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        assignedTo: mapUserReference(
            ticket.assignedToUserId,
            ticket.assignedToName,
            ticket.assignedToEmail
        ),
        createdBy: mapUserReference(
            ticket.createdByUserId,
            ticket.createdByName,
            ticket.createdByEmail
        ),
        updatedBy: mapUserReference(
            ticket.updatedByUserId,
            ticket.updatedByName,
            ticket.updatedByEmail
        ),
        tags: (ticket.tags || []).map(mapTagResponse),
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
    };
}

export function mapTicketMessageResponse(message) {
    return {
        id: message.id,
        ticketId: message.ticket?.ticketId || message.ticketId,
        sender: {
            userId: message.senderUserId,
            name: message.senderName,
            email: message.senderEmail
        },
        type: message.messageType,
        content: message.content,
        createdAt: message.createdAt
    };
}

export default mapTicketResponse;
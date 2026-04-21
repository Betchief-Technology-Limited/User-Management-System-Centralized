import prisma from "../../database/prisma/client.js";

const defaultTicketInclude = {
    tags: {
        include: {
            tag: true
        },
        orderBy: {
            createdAt: "asc"
        }
    }
};

function buildTicketInclude({
    includeMessages = false,
    includeStatusHistory = false,
    includeAssignmentHistory = false
} = {}) {
    return {
        ...defaultTicketInclude,
        ...(includeMessages
            ? {
                messages: {
                    orderBy: {
                        createdAt: "asc"
                    }
                }
            }
            : {}),
        ...(includeStatusHistory
            ? {
                statusHistory: {
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
            : {}),
        ...(includeAssignmentHistory
            ? {
                assignmentHistory: {
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
            : {})
    };
}

export async function ticketIdExists(ticketId) {
    const existingTicket = await prisma.ticket.findUnique({
        where: { ticketId },
        select: { id: true }
    });

    return Boolean(existingTicket);
}

export async function createTicketWithStatusHistory({ ticketData, statusHistoryData }) {
    return prisma.$transaction(async (tx) => {
        const ticket = await tx.ticket.create({
            data: ticketData
        });

        await tx.ticketStatusHistory.create({
            data: {
                ...statusHistoryData,
                ticketRefId: ticket.id
            }
        });

        return tx.ticket.findUnique({
            where: { id: ticket.id },
            include: defaultTicketInclude
        });
    });
}

export async function listTickets({ where, skip, take, orderBy }) {
    return prisma.ticket.findMany({
        where,
        skip,
        take,
        orderBy,
        include: defaultTicketInclude
    });
}

export async function countTickets(where) {
    return prisma.ticket.count({ where });
}

export async function findTicketByPublicId(ticketId, includeOptions = {}) {
    return prisma.ticket.findUnique({
        where: { ticketId },
        include: buildTicketInclude(includeOptions)
    });
}

export async function updateTicketStatusWithHistory({
    ticketRefId,
    status,
    updatedBy,
    history
}) {
    return prisma.$transaction(async (tx) => {
        await tx.ticket.update({
            where: { id: ticketRefId },
            data: {
                status,
                updatedByUserId: updatedBy.userId,
                updatedByName: updatedBy.name,
                updatedByEmail: updatedBy.email
            }
        });

        await tx.ticketStatusHistory.create({
            data: {
                ticketRefId,
                oldStatus: history.oldStatus,
                newStatus: history.newStatus,
                changedByUserId: history.changedByUserId,
                changedByName: history.changedByName,
                changedByEmail: history.changedByEmail
            }
        });

        return tx.ticket.findUnique({
            where: { id: ticketRefId },
            include: defaultTicketInclude
        });
    });
}

export async function updateTicketAssignmentWithHistory({
    ticketRefId,
    assignment,
    updatedBy,
    history
}) {
    return prisma.$transaction(async (tx) => {
        await tx.ticket.update({
            where: { id: ticketRefId },
            data: {
                assignedToUserId: assignment.userId,
                assignedToName: assignment.name,
                assignedToEmail: assignment.email,
                updatedByUserId: updatedBy.userId,
                updatedByName: updatedBy.name,
                updatedByEmail: updatedBy.email
            }
        });

        await tx.ticketAssignmentHistory.create({
            data: {
                ticketRefId,
                previousAssignedToUserId: history.previousAssignedToUserId,
                previousAssignedToName: history.previousAssignedToName,
                previousAssignedToEmail: history.previousAssignedToEmail,
                newAssignedToUserId: history.newAssignedToUserId,
                newAssignedToName: history.newAssignedToName,
                newAssignedToEmail: history.newAssignedToEmail,
                assignedByUserId: history.assignedByUserId,
                assignedByName: history.assignedByName,
                assignedByEmail: history.assignedByEmail
            }
        });

        return tx.ticket.findUnique({
            where: { id: ticketRefId },
            include: defaultTicketInclude
        });
    });
}

export async function createTicketMessage({ ticketRefId, messageData }) {
    return prisma.ticketMessage.create({
        data: {
            ticketRefId,
            ...messageData
        }
    });
}

export async function listTicketMessages({
    ticketRefId,
    messageType,
    skip,
    take
}) {
    const where = {
        ticketRefId,
        ...(messageType ? { messageType } : {})
    };

    const [messages, total] = await prisma.$transaction([
        prisma.ticketMessage.findMany({
            where,
            skip,
            take,
            orderBy: {
                createdAt: "asc"
            },
            include: {
                ticket: {
                    select: {
                        ticketId: true
                    }
                }
            }
        }),
        prisma.ticketMessage.count({ where })
    ]);

    return { messages, total };
}

export async function findTicketTagById(tagId) {
    return prisma.ticketTag.findUnique({
        where: { id: tagId }
    });
}

export async function findTicketTagByName(name) {
    return prisma.ticketTag.findUnique({
        where: { name }
    });
}

export async function createTicketTag(name) {
    return prisma.ticketTag.create({
        data: { name }
    });
}

export async function findTicketTagMapping(ticketRefId, tagId) {
    return prisma.ticketTagMap.findFirst({
        where: {
            ticketId: ticketRefId,
            tagId
        }
    });
}

export async function addTagToTicket(ticketRefId, tagId) {
    return prisma.ticketTagMap.create({
        data: {
            ticketId: ticketRefId,
            tagId
        }
    });
}

export async function removeTagFromTicket(ticketRefId, tagId) {
    return prisma.ticketTagMap.deleteMany({
        where: {
            ticketId: ticketRefId,
            tagId
        }
    });
}
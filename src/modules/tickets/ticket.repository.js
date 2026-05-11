import prisma from "../../database/prisma/client.js";

function buildTicketInclude({
    includeMessages = false,
    includeStatusHistory = false,
    includeAssignmentHistory = false,
    includeEvents = false
    } = {}) {
    return {
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
            : {}),
        ...(includeEvents
            ? {
                events: {
                    orderBy: {
                        createdAt: "asc"
                    },
                    include: {
                        chat: true,
                        email: true,
                        call: {
                            include: {
                                logs: {
                                    orderBy: {
                                        timestamp: "asc"
                                    }
                                }
                            }
                        }
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

export async function findExistingTicketCustomer({ customerPhone, customerEmail }) {
    const conditions = [
        customerPhone ? { customerPhone } : null,
        customerEmail ? { customerEmail } : null
    ].filter(Boolean);

    if (!conditions.length) {
        return null;
    }

    return prisma.ticket.findFirst({
        where: {
            OR: conditions
        },
        orderBy: {
            createdAt: "asc"
        },
        select: {
            customerId: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true
        }
    });
}

function buildTicketEventCreate({ ticketRefId, event }) {
    return {
        ticketId: ticketRefId,
        type: event.type,
        channel: event.channel,
        createdBy: event.createdBy,
        metadata: event.metadata
    };
}

async function createTicketEventChannel(tx, eventId, event) {
    if (event.chat) {
        await tx.ticketChatMessage.create({
            data: {
                ticketEventId: eventId,
                ...event.chat
            }
        });
    }

    if (event.email) {
        await tx.ticketEmailMessage.create({
            data: {
                ticketEventId: eventId,
                ...event.email
            }
        });
    }

    if (event.call) {
        const call = await tx.ticketCall.create({
            data: {
                ticketEventId: eventId,
                duration: event.call.duration,
                recordingUrl: event.call.recordingUrl
            }
        });

        if (event.call.initialLog) {
            await tx.ticketCallLog.create({
                data: {
                    callId: call.id,
                    ...event.call.initialLog
                }
            });
        }
    }
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
            where: { id: ticket.id }
        });
    });
}

export async function createTicketWithTimeline({
    ticketData,
    statusHistoryData,
    assignmentHistoryData,
    initialEvent
}) {
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

        if (assignmentHistoryData) {
            await tx.ticketAssignmentHistory.create({
                data: {
                    ...assignmentHistoryData,
                    ticketRefId: ticket.id
                }
            });
        }

        if (initialEvent) {
            const event = await tx.ticketEvent.create({
                data: buildTicketEventCreate({
                    ticketRefId: ticket.id,
                    event: initialEvent
                })
            });

            await createTicketEventChannel(tx, event.id, initialEvent);
        }

        return tx.ticket.findUnique({
            where: { id: ticket.id }
        });
    });
}

export async function listTickets({ where, skip, take, orderBy }) {
    return prisma.ticket.findMany({
        where,
        skip,
        take,
        orderBy
    });
}

export async function countTickets(where) {
    return prisma.ticket.count({ where });
}

export async function findTicketByPublicId(ticketId, includeOptions = {}) {
    const include = buildTicketInclude(includeOptions);

    return prisma.ticket.findUnique({
        where: { ticketId },
        ...(Object.keys(include).length > 0 ? { include } : {})
    });
}

export async function createTicketEvent({ ticketRefId, event }) {
    return prisma.$transaction(async (tx) => {
        const createdEvent = await tx.ticketEvent.create({
            data: buildTicketEventCreate({
                ticketRefId,
                event
            })
        });

        await createTicketEventChannel(tx, createdEvent.id, event);

        return tx.ticketEvent.findUnique({
            where: { id: createdEvent.id },
            include: {
                chat: true,
                email: true,
                call: {
                    include: {
                        logs: {
                            orderBy: {
                                timestamp: "asc"
                            }
                        }
                    }
                }
            }
        });
    });
}

export async function createTicketMessageWithEvent({
    ticketRefId,
    messageData,
    event
}) {
    return prisma.$transaction(async (tx) => {
        const message = await tx.ticketMessage.create({
            data: {
                ticketRefId,
                ...messageData
            }
        });

        const createdEvent = await tx.ticketEvent.create({
            data: buildTicketEventCreate({
                ticketRefId,
                event: {
                    ...event,
                    metadata: {
                        ...(event.metadata || {}),
                        legacyMessageId: message.id
                    }
                }
            })
        });

        await createTicketEventChannel(tx, createdEvent.id, event);

        return message;
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
            where: { id: ticketRefId }
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
            where: { id: ticketRefId }
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

export async function listTicketEvents(ticketRefId) {
    return prisma.ticketEvent.findMany({
        where: { ticketId: ticketRefId },
        orderBy: {
            createdAt: "asc"
        },
        include: {
            chat: true,
            email: true,
            call: {
                include: {
                    logs: {
                        orderBy: {
                            timestamp: "asc"
                        }
                    }
                }
            }
        }
    });
}

export async function appendTicketCallLog({ callId, log }) {
    return prisma.ticketCallLog.create({
        data: {
            callId,
            ...log
        }
    });
}

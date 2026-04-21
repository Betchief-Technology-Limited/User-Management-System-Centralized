export const TICKET_STATUS = Object.freeze({
    OPEN: "OPEN",
    PENDING: "PENDING",
    RESOLVED: "RESOLVED",
    CLOSED: "CLOSED",
});

export const MESSAGE_TYPE = Object.freeze({
    MESSAGE: "message",
    INTERNAL_NOTE: "internal_note",
});

export const TICKET_PERMISSION = Object.freeze({
    CREATE: "ticket.create",
    VIEW: "ticket.view",
    UPDATE_STATUS: "ticket.update_status",
    ASSIGN: "ticket.assign",
    MESSAGE: "ticket.message",
    ADD_NOTE: "ticket.add_note",
    TAG: "ticket.tag",
});

export const TICKET_PERMISSIONS = TICKET_PERMISSION;

export const DEFAULT_TICKET_PAGE = 1;
export const DEFAULT_TICKET_LIMIT = 20;
export const MAX_TICKET_LIMIT = 100;
export const TICKET_ID_PREFIX = "TCKT";

export function buildTicketFilters({ status, assignedToUserId }) {
    const where = {};

    if (status) {
        where.status = status;
    }

    if (assignedToUserId) {
        where.assignedToUserId = assignedToUserId;
    }

    return where;

}

export default buildTicketFilters;
import { USER_STATUS, SYSTEM_ROLE } from "../../../shared/constants/system.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { normalizePermissionList } from "../../roles/role.service.js";
import { getUserById } from "../../users/user.service.js";
import { TICKET_PERMISSIONS } from "../ticket.constants.js";
import { buildUserSnapshot } from "../ticket.utils.js";

const ASSIGNABLE_TICKET_PERMISSIONS = [
    TICKET_PERMISSIONS.RECEIVE_ASSIGNMENT,
    TICKET_PERMISSIONS.CREATE,
    TICKET_PERMISSIONS.ASSIGN,
    TICKET_PERMISSIONS.VIEW
];

function getUserPermissions(user) {
    return normalizePermissionList([
        ...(user?.allowedPermissions || []),
        ...(user?.role?.permissions || []),
        ...(user?.roleId?.permissions || [])
    ]);
}

function getRoleName(user) {
    return user?.role?.name || user?.roleId?.name;
}

export function canReceiveTicketAssignment(user) {
    if (getRoleName(user) === SYSTEM_ROLE.SUPER_ADMIN) {
        return true;
    }

    const permissionSet = new Set(getUserPermissions(user));

    return ASSIGNABLE_TICKET_PERMISSIONS.some((permission) => permissionSet.has(permission));
}

export async function getAssignableUserSnapshot(userId) {
    const user = await getUserById(userId);

    if (user.status !== USER_STATUS.ACTIVE) {
        throw new AppError("Only active users can be assigned to tickets", 400);
    }

    if (!canReceiveTicketAssignment(user)) {
        throw new AppError("Only support agents or super admins can be assigned to tickets", 400);
    }

    return buildUserSnapshot(user);
}

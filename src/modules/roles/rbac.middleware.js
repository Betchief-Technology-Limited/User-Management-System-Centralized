import { AppError } from "../../shared/errors/AppError.js";
import { USER_STATUS } from "../../shared/constants/system.js";
import { normalizePermissionKey } from "../../shared/utils/permissionKey.js";
import { getEffectivePermissionsFromUser } from "./role.service.js";

export function requirePermission(permissionName) {
    const normalizedPermissionName = normalizePermissionKey(permissionName);

    return async function (req, res, next) {
        try {
            if (!req.user?.sub || !req.currentUser) {
                return next(new AppError("Unauthorized", 401));
            }

            if (req.currentUser.status !== USER_STATUS.ACTIVE) {
                return next(new AppError("User account is not active", 403));
            }

            if (req.currentUser.mustChangePassword) {
                return next(
                    new AppError(
                        "Password change is required before using protected resources",
                        403
                    )
                );
            }

            const permissions = getEffectivePermissionsFromUser(req.currentUser);

            if (!permissions.includes(normalizedPermissionName)) {
                return next(new AppError("Forbidden: insufficient permissions", 403));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}
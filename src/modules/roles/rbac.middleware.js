import { AppError } from "../../shared/errors/AppError.js";
import { getUserPermissions } from "./role.service.js";

export function requirePermission(permissionName) {
    return async function (req, res, next) {
        try {
            if (!req.user?.sub) {
                return next(new AppError("Unauthorized", 401))
            }

            const permissions = await getUserPermissions(req.user.sub);

            if (!permissions.includes(permissionName)) {
                return next(new AppError("Forbidden: insufficient permissions", 403))
            }

            next();
        } catch (error) {
            next(error)
        }
    }
}
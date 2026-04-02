import successResponse from "../../shared/utils/apiResponse.js";
import {
    createPermission,
    getPermissions
} from "./permission.service.js";

export async function createPermissionHandler(req, res) {
    const permission = await createPermission(req.validatedBody);

    return successResponse(res, "Permission created successfully", { permission }, 201);
}

export async function getPermissionsHandler(req, res) {
    const permissions = await getPermissions();

    return successResponse(res, "Permissions fetched successfully", { permissions });
}
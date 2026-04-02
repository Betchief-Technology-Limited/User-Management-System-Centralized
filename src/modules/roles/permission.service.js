import Permission from "../../database/model/permission.model.js";
import { AppError } from "../../shared/errors/AppError.js";

export async function createPermission({ name, description }) {
    const existingPermission = await Permission.findOne({ name });

    if (existingPermission) {
        throw new AppError("Permission already exists", 409);
    }

    const permission = await Permission.create({
        name,
        description
    });

    return permission;
}

// Get role permission
export async function getPermissions() {
    return Permission.find().sort({ createdAt: -1 })
}
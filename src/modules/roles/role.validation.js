import { z } from "zod";

export const createRoleSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional()
});

export const assignPermissionToRoleSchema = z.object({
    permissionId: z.string().min(1)
});

export const assignRoleToUserSchema = z.object({
    userId: z.string().min(1),
    roleId: z.string().min(1)
})
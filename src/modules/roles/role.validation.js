import { z } from "zod";

const objectIdSchema = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid idnetifier")

export const createRoleSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional()
});

export const assignPermissionToRoleSchema = z.object({
    permissionIds: z.array(objectIdSchema).min(1)
});

export const assignRoleToUserSchema = z.object({
    userId: objectIdSchema,
    roleId: objectIdSchema
})

export const removeRoleFromUserSchema = z.object({
    userId: objectIdSchema,
    roleId: objectIdSchema
})
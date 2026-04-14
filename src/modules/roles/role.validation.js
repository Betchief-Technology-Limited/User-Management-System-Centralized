import { z } from "zod";

const objectIdSchema = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid idnetifier")

export const createRoleSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional()
});

const permissionGroupSchema = z.object({
    resource: z.string().min(1),
    actions: z.array(z.string().min(1)).min(1)
});

export const assignPermissionToRoleSchema = z.object({
    permissionIds: z.array(objectIdSchema).min(1).optional(),
    permissions: z.array(permissionGroupSchema).min(1).optional()
})
    .refine(
        (data) =>
            Boolean(data.permissionIds?.length) || Boolean(data.permissions?.length),
        {
            message:
            "Provide either permissionId or grouped permissions for assignment"
        }
)

export const assignRoleToUserSchema = z.object({
    userId: objectIdSchema,
    roleId: objectIdSchema
})

export const removeRoleFromUserSchema = z.object({
    userId: objectIdSchema,
    roleId: objectIdSchema
})
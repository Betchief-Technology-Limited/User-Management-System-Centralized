import { z } from "zod"

export const createPermissionSchema = z.object({
    name: z.string().min(1).optional(),
    resource: z.string().min(1).optional(),
    action: z.string().min(1).optional(),
    description: z.string().optional()
}).refine(
    (data) => Boolean(data.name) || (Boolean(data.resource) && Boolean(data.action)),
    {
        message: "Provide either a permission name or both resource and action",
    }
)
import { z } from "zod";

export const createRoleSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    permissions: z.array(z.string().min(1)).min(1)
})
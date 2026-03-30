import z from "zod";

export const createUserSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    firstName: z.string().min(2, "Name must be at least 2 characters"),
    lastName: z.string().min(2, "Name must be at least 2 characters")
})

export const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImage: z.string().optional(),
  phoneNumber: z.string().optional(),
  metadata: z.object({}).optional(),
});

 export const updateUserStatusSchema = z.object({
  status: z.enum(["active", "inactive", "suspended"]),
});


import express from "express";
import asyncHandler from "../../middleware/async.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
    createUserHandler,
    deleteUserHandler,
    getUserHandler,
    getUsersHandler,
    updateUserHandler,
    updateUserStatusHandler
} from "./user.controller.js";

import {
    createUserSchema,
    updateUserSchema,
    updateUserStatusSchema
} from "./user.validation.js";

const userRoutes = express.Router();

userRoutes.use(requireAuth)

userRoutes.post("/users", validate(createUserSchema), asyncHandler(createUserHandler));
userRoutes.get("/users", asyncHandler(getUsersHandler));
userRoutes.get("/user:id", asyncHandler(getUserHandler));
userRoutes.patch("/user:id", validate(updateUserSchema), asyncHandler(updateUserHandler));
userRoutes.patch(
    "/user:id/status",
    validate(updateUserStatusSchema),
    asyncHandler(updateUserStatusHandler)
);
userRoutes.delete("/user:id", asyncHandler(deleteUserHandler));

export default userRoutes;
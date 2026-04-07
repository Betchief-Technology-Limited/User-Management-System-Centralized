import express from "express";
import asyncHandler from "../../middleware/async.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requirePermission } from "../roles/rbac.middleware.js";
import { 
    createInvitationHandler,
    previewInvitationHandler,
    acceptInvitationHandler 
} from "./invitation.controller.js";

import { createInvitationSchema, acceptInvitationSchema } from "./invitation.validation.js";

const invitationRoutes = express.Router();

invitationRoutes.post(
    "/invitations",
    requireAuth,
    requirePermission("manage_users"),
    validate(createInvitationSchema),
    asyncHandler(createInvitationHandler)
)

invitationRoutes.get(
    "/invitations/preview",
    asyncHandler(previewInvitationHandler)
)

invitationRoutes.post(
    "/invitations/accept",
    validate(acceptInvitationSchema),
    asyncHandler(acceptInvitationHandler)
)

export default invitationRoutes;

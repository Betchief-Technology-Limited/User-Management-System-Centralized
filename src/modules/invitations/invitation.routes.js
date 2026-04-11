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

/**
 * @openapi
 * /invitations:
 *   post:
 *     tags: [Invitations]
 *     summary: Invite user to role
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInvitationRequest'
 */
invitationRoutes.post(
    "/invitations",
    requireAuth,
    requirePermission("manage_users"),
    validate(createInvitationSchema),
    asyncHandler(createInvitationHandler)
)

/**
 * @openapi
 * /invitations/preview:
 *   get:
 *     tags: [Invitations]
 *     summary: Preview invitation
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 */
invitationRoutes.get(
    "/invitations/preview",
    asyncHandler(previewInvitationHandler)
)

/**
 * @openapi
 * /invitations/accept:
 *   post:
 *     tags: [Invitations]
 *     summary: Accept invitation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcceptInvitationRequest'
 */
invitationRoutes.post(
    "/invitations/accept",
    validate(acceptInvitationSchema),
    asyncHandler(acceptInvitationHandler)
)

export default invitationRoutes;

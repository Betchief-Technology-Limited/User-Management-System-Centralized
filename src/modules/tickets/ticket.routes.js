import express from "express";
import asyncHandler from "../../middleware/async.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requirePermission } from "../roles/rbac.middleware.js";
import {
    createTicketHandler,
    getTicketDetailHandler,
    listTicketsHandler
} from "./ticket.controller.js";
import {
    createTicketSchema,
    listTicketsQuerySchema,
    ticketIdParamSchema
} from "./ticket.validation.js";
import { TICKET_PERMISSIONS } from "./ticket.constants.js";
import { updateTicketStatusHandler } from "./status/status.contoller.js";
import { updateTicketStatusSchema } from "./status/status.validation.js";
import { assignTicketHandler } from "./assignments/assignment.controller.js";
import { assignTicketSchema } from "./assignments/assignment.validation.js";
import {
    addInternalNoteHandler,
    listInternalNotesHandler,
    listTicketMessagesHandler,
    sendTicketMessageHandler
} from "./messages/message.controller.js";
import {
    createMessageSchema,
    listMessagesQuerySchema
} from "./messages/message.validation.js";
import {
    addTicketTagHandler,
    removeTicketTagHandler
} from "./tags/tag.controller.js";
import {
    createTicketTagSchema,
    removeTicketTagParamSchema
} from "./tags/tag.validation.js";

const ticketRoutes = express.Router();

ticketRoutes.use(requireAuth);

/**
 * @openapi
 * /tickets:
 *   post:
 *     tags: [Tickets]
 *     summary: Create a ticket
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTicketRequest'
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketResponse'
 */
ticketRoutes.post(
    "/tickets",
    requirePermission(TICKET_PERMISSIONS.CREATE),
    validate(createTicketSchema),
    asyncHandler(createTicketHandler)
);

/**
 * @openapi
 * /tickets:
 *   get:
 *     tags: [Tickets]
 *     summary: List tickets
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, PENDING, RESOLVED, CLOSED]
 *       - in: query
 *         name: assignedToUserId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tickets fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketListResponse'
 */
ticketRoutes.get(
    "/tickets",
    requirePermission(TICKET_PERMISSIONS.VIEW),
    validate(listTicketsQuerySchema, "query"),
    asyncHandler(listTicketsHandler)
);

/**
 * @openapi
 * /tickets/{ticketId}:
 *   get:
 *     tags: [Tickets]
 *     summary: Get a single ticket by public ticketId
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketResponse'
 */
ticketRoutes.get(
    "/tickets/:ticketId",
    requirePermission(TICKET_PERMISSIONS.VIEW),
    validate(ticketIdParamSchema, "params"),
    asyncHandler(getTicketDetailHandler)
);

/**
 * @openapi
 * /tickets/{ticketId}/status:
 *   patch:
 *     tags: [Tickets]
 *     summary: Update ticket status
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTicketStatusRequest'
 *     responses:
 *       200:
 *         description: Ticket status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketResponse'
 */
ticketRoutes.patch(
    "/tickets/:ticketId/status",
    requirePermission(TICKET_PERMISSIONS.UPDATE_STATUS),
    validate(ticketIdParamSchema, "params"),
    validate(updateTicketStatusSchema),
    asyncHandler(updateTicketStatusHandler)
);

/**
 * @openapi
 * /tickets/{ticketId}/assign:
 *   patch:
 *     tags: [Tickets]
 *     summary: Assign ticket to an agent
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignTicketRequest'
 *     responses:
 *       200:
 *         description: Ticket assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketResponse'
 */
ticketRoutes.patch(
    "/tickets/:ticketId/assign",
    requirePermission(TICKET_PERMISSIONS.ASSIGN),
    validate(ticketIdParamSchema, "params"),
    validate(assignTicketSchema),
    asyncHandler(assignTicketHandler)
);

/**
 * @openapi
 * /tickets/{ticketId}/messages:
 *   post:
 *     tags: [Tickets]
 *     summary: Send a ticket message
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTicketMessageRequest'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketMessageResponse'
 *   get:
 *     tags: [Tickets]
 *     summary: Fetch ticket messages
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketMessageListResponse'
 */
ticketRoutes.post(
    "/tickets/:ticketId/messages",
    requirePermission(TICKET_PERMISSIONS.MESSAGE),
    validate(ticketIdParamSchema, "params"),
    validate(createMessageSchema),
    asyncHandler(sendTicketMessageHandler)
);

ticketRoutes.get(
    "/tickets/:ticketId/messages",
    requirePermission(TICKET_PERMISSIONS.VIEW),
    validate(ticketIdParamSchema, "params"),
    validate(listMessagesQuerySchema, "query"),
    asyncHandler(listTicketMessagesHandler)
);

/**
 * @openapi
 * /tickets/{ticketId}/internal-notes:
 *   post:
 *     tags: [Tickets]
 *     summary: Add an internal note to a ticket
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTicketMessageRequest'
 *     responses:
 *       201:
 *         description: Internal note added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketMessageResponse'
 *   get:
 *     tags: [Tickets]
 *     summary: Fetch internal notes for a ticket
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Internal notes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketMessageListResponse'
 */
ticketRoutes.post(
    "/tickets/:ticketId/internal-notes",
    requirePermission(TICKET_PERMISSIONS.ADD_NOTE),
    validate(ticketIdParamSchema, "params"),
    validate(createMessageSchema),
    asyncHandler(addInternalNoteHandler)
);

ticketRoutes.get(
    "/tickets/:ticketId/internal-notes",
    requirePermission(TICKET_PERMISSIONS.ADD_NOTE),
    validate(ticketIdParamSchema, "params"),
    validate(listMessagesQuerySchema, "query"),
    asyncHandler(listInternalNotesHandler)
);

/**
 * @openapi
 * /tickets/{ticketId}/tags:
 *   post:
 *     tags: [Tickets]
 *     summary: Add a tag to a ticket
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketTagRequest'
 *     responses:
 *       201:
 *         description: Tag added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketTagOperationResponse'
 */
ticketRoutes.post(
    "/tickets/:ticketId/tags",
    requirePermission(TICKET_PERMISSIONS.TAG),
    validate(ticketIdParamSchema, "params"),
    validate(createTicketTagSchema),
    asyncHandler(addTicketTagHandler)
);

/**
 * @openapi
 * /tickets/{ticketId}/tags/{tagId}:
 *   delete:
 *     tags: [Tickets]
 *     summary: Remove a tag from a ticket
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketTagOperationResponse'
 */
ticketRoutes.delete(
    "/tickets/:ticketId/tags/:tagId",
    requirePermission(TICKET_PERMISSIONS.TAG),
    validate(removeTicketTagParamSchema, "params"),
    asyncHandler(removeTicketTagHandler)
);

export default ticketRoutes;

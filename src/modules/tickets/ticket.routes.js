import express from "express";
import asyncHandler from "../../middleware/async.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requirePermission } from "../roles/rbac.middleware.js";
import {
    createTicketHandler,
    getTicketDetailHandler,
    getTicketThreadHandler,
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
import { addTicketEventHandler } from "./timeline/timeline.controller.js";
import { createTicketEventSchema } from "./timeline/timeline.validation.js";

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
 *           examples:
 *             chat:
 *               summary: Start ticket from chat
 *               value:
 *                 title: "Dashboard access issue"
 *                 description: "Customer cannot access the dashboard after resetting password."
 *                 priority: "HIGH"
 *                 assignedToUserId: "680ab1234c56d7890ef67890"
 *                 customerName: "Sarah Chen"
 *                 customerEmail: "sarah.chen@example.com"
 *                 channel: "CHAT"
 *                 chat:
 *                   message: "Customer cannot access the dashboard after resetting password."
 *                   senderType: "CUSTOMER"
 *             email:
 *               summary: Start ticket from email
 *               value:
 *                 title: "Unable to access dashboard"
 *                 description: "Customer reports dashboard access failure after password reset."
 *                 priority: "MEDIUM"
 *                 customerName: "Sarah Chen"
 *                 customerEmail: "sarah.chen@example.com"
 *                 channel: "EMAIL"
 *                 email:
 *                   subject: "Unable to access dashboard"
 *                   body: "Customer reports that dashboard access fails after password reset."
 *                   fromEmail: "sarah.chen@example.com"
 *                   toEmail: "support@example.com"
 *             call:
 *               summary: Start ticket from phone call
 *               value:
 *                 title: "Wallet funding issue"
 *                 description: "Customer wallet funding is failing on the mobile app."
 *                 priority: "MEDIUM"
 *                 customerName: "Sarah Chen"
 *                 customerPhone: "+2348012345678"
 *                 channel: "PHONE"
 *                 call:
 *                   duration: 180
 *                   direction: "INBOUND"
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
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
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
 * /tickets/{ticketId}/thread:
 *   get:
 *     tags: [Tickets]
 *     summary: Fetch a unified ticket thread timeline
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
 *         description: Ticket thread fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketThreadResponse'
 */
ticketRoutes.get(
    "/tickets/:ticketId/thread",
    requirePermission(TICKET_PERMISSIONS.VIEW),
    validate(ticketIdParamSchema, "params"),
    asyncHandler(getTicketThreadHandler)
);

/**
 * @openapi
 * /tickets/{ticketId}/events:
 *   post:
 *     tags: [Tickets]
 *     summary: Append a new timeline event to an existing ticket
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
 *             $ref: '#/components/schemas/CreateTicketEventRequest'
 *           examples:
 *             chat:
 *               summary: Add a chat reply
 *               value:
 *                 channel: "CHAT"
 *                 chat:
 *                   message: "Please clear cache and try again."
 *                   senderType: "AGENT"
 *             email:
 *               summary: Continue via email
 *               value:
 *                 channel: "EMAIL"
 *                 email:
 *                   subject: "Reset link reissued"
 *                   body: "We have re-issued the reset link. Please try again."
 *                   fromEmail: "support@example.com"
 *                   toEmail: "sarah.chen@example.com"
 *             call:
 *               summary: Log a call event
 *               value:
 *                 channel: "PHONE"
 *                 call:
 *                   duration: 120
 *                   direction: "OUTBOUND"
 *     responses:
 *       201:
 *         description: Ticket event added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketThreadItemResponse'
 */
ticketRoutes.post(
    "/tickets/:ticketId/events",
    requirePermission(TICKET_PERMISSIONS.MESSAGE),
    validate(ticketIdParamSchema, "params"),
    validate(createTicketEventSchema),
    asyncHandler(addTicketEventHandler)
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

export default ticketRoutes;

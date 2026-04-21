import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import express from "express";
import request from "supertest";

const getTickets = jest.fn();

const requireAuth = (req, res, next) => {
    req.user = { sub: "admin-id" };
    req.currentUser = {
        _id: "admin-id",
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        status: "active"
    };
    next();
};

const requirePermission = () => (req, res, next) => next();
const asyncHandler = (handler) => (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
const validate = (_schema, location = "body") => (req, res, next) => {
    if (location === "query") {
        req.validatedQuery = req.query;
    } else if (location === "params") {
        req.validatedParams = req.params;
    } else {
        req.validatedBody = req.body;
    }

    next();
};

jest.unstable_mockModule("../../src/middleware/async.middleware.js", () => ({
    default: asyncHandler
}));

jest.unstable_mockModule(
    "../../src/middleware/validate.middleware.js",
    () => ({
        validate
    })
);

jest.unstable_mockModule(
    "../../src/modules/middleware/auth.middleware.js",
    () => ({
        requireAuth
    })
);

jest.unstable_mockModule(
    "../../src/modules/roles/rbac.middleware.js",
    () => ({
        requirePermission
    })
);

jest.unstable_mockModule(
    "../../src/modules/tickets/ticket.service.js",
    () => ({
        createTicket: jest.fn(),
        getTicketDetail: jest.fn(),
        getTickets
    })
);

const { default: ticketRoutes } = await import(
    "../../src/modules/tickets/ticket.routes.js"
);

describe("ticket routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns the inbox payload shape for GET /tickets", async () => {
        getTickets.mockResolvedValue({
            tickets: [
                {
                    id: "ticket-db-id",
                    ticketId: "TKT-20260420-ABC123",
                    title: "Wallet issue",
                    description: "Customer wallet is not updating",
                    status: "OPEN",
                    assignedTo: null,
                    createdBy: {
                        userId: "admin-id",
                        name: "Admin User",
                        email: "admin@example.com"
                    },
                    updatedBy: {
                        userId: "admin-id",
                        name: "Admin User",
                        email: "admin@example.com"
                    },
                    tags: [],
                    createdAt: "2026-04-20T12:00:00.000Z",
                    updatedAt: "2026-04-20T12:00:00.000Z"
                }
            ],
            meta: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1
            }
        });

        const app = express();
        app.use(express.json());
        app.use(ticketRoutes);
        app.use((error, req, res, next) => {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message
            });
        });

        const response = await request(app)
            .get("/tickets")
            .query({ status: "OPEN", page: 1, limit: 20 });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "Tickets fetched successfully",
            data: {
                tickets: [
                    {
                        id: "ticket-db-id",
                        ticketId: "TKT-20260420-ABC123",
                        title: "Wallet issue",
                        description: "Customer wallet is not updating",
                        status: "OPEN",
                        assignedTo: null,
                        createdBy: {
                            userId: "admin-id",
                            name: "Admin User",
                            email: "admin@example.com"
                        },
                        updatedBy: {
                            userId: "admin-id",
                            name: "Admin User",
                            email: "admin@example.com"
                        },
                        tags: [],
                        createdAt: "2026-04-20T12:00:00.000Z",
                        updatedAt: "2026-04-20T12:00:00.000Z"
                    }
                ]
            },
            meta: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1
            }
        });
    });
});
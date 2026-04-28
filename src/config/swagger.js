import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "FUMS Core API",
            version: "1.0.0",
            description: "Flexible User Management System API",
        },
        servers: [
            {
                url: "http://localhost:4008/api/v1",
                description: "Local development",
            },
            {
                url: "https://user-management-system-centralized.onrender.com/api/v1",
                description: "Production",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "accessToken"
                },
                refreshCookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "refreshToken"
                },
            },
            schemas: {
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: false,
                        },
                        message: {
                            type: "string",
                            example: "Operation failed",
                        },
                    },
                },

                SuccessMessageResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true,
                        },
                        message: {
                            type: "string",
                            example: "Operation successful",
                        },
                        data: {
                            type: "object",
                            additionalProperties: true,
                            example: {},
                        },
                    },
                },

                RegisterRequest: {
                    type: "object",
                    required: ["email", "password", "firstName", "lastName"],
                    properties: {
                        email: {
                            type: "string",
                            example: "admin@example.com",
                        },
                        password: {
                            type: "string",
                            example: "password123",
                        },
                        firstName: {
                            type: "string",
                            example: "Matthew",
                        },
                        lastName: {
                            type: "string",
                            example: "Olanipekun",
                        },
                    },
                },

                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: {
                            type: "string",
                            example: "admin@example.com",
                        },
                        password: {
                            type: "string",
                            example: "password123",
                        },
                    },
                },

                UpdatePasswordRequest: {
                    type: "object",
                    required: ["currentPassword", "newPassword", "confirmPassword"],
                    properties: {
                        currentPassword: {
                            type: "string",
                            example: "temporaryPassword123",
                        },
                        newPassword: {
                            type: "string",
                            example: "MySecurePassword123",
                        },
                        confirmPassword: {
                            type: "string",
                            example: "MySecurePassword123",
                        },
                    },
                },

                ResetPasswordRequest: {
                    type: "object",
                    required: ["token", "password", "confirmPassword"],
                    properties: {
                        token: {
                            type: "string",
                            example: "password_reset_token",
                        },
                        password: {
                            type: "string",
                            example: "newpassword123",
                        },
                        confirmPassword: {
                            type: "string",
                            example: "newpassword123",
                        },
                    },
                },

                UpdateUserRequest: {
                    type: "object",
                    properties: {
                        firstName: {
                            type: "string",
                            example: "Updated",
                        },
                        lastName: {
                            type: "string",
                            example: "User",
                        },
                        phoneNumber: {
                            type: "string",
                            example: "08012345678",
                        },
                        profileImage: {
                            type: "string",
                            example: "https://example.com/avatar.jpg",
                        },
                        metadata: {
                            type: "object",
                            additionalProperties: true,
                            example: {
                                department: "Engineering",
                            },
                        },
                        roleId: {
                            type: "string",
                            nullable: true,
                            example: "680ab1234c56d7890ef67890",
                        },
                        status: {
                            type: "string",
                            enum: ["active", "inactive", "suspended"],
                            example: "inactive",
                        },
                        deniedPermissions: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            example: ["wallet.fund", "wallet.delete"],
                        },
                    },
                },

                CreateRoleRequest: {
                    type: "object",
                    required: ["name", "permissions"],
                    properties: {
                        name: {
                            type: "string",
                            example: "Account Officer",
                        },
                        description: {
                            type: "string",
                            example: "Account operations role",
                        },
                        permissions: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            example: [
                                "wallet.read",
                                "wallet.fund",
                                "wallet.update",
                                "wallet.delete"
                            ],
                        },
                    },
                },

                UpdateRoleRequest: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            example: "Financial Officer",
                        },
                        description: {
                            type: "string",
                            example: "Updated account operations role",
                        },
                        permissions: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            example: [
                                "wallet.read",
                                "wallet.update"
                            ],
                        },
                    },
                },

                CreateTicketRequest: {
                    type: "object",
                    required: ["title", "description"],
                    properties: {
                        title: {
                            type: "string",
                            example: "Wallet funding issue"
                        },
                        description: {
                            type: "string",
                            example: "Customer wallet funding is failing on the mobile app."
                        },
                        priority: {
                            type: "string",
                            enum: ["LOW", "MEDIUM", "HIGH"],
                            example: "MEDIUM"
                        }
                    }
                },

                UpdateTicketStatusRequest: {
                    type: "object",
                    required: ["status"],
                    properties: {
                        status: {
                            type: "string",
                            enum: ["OPEN", "PENDING", "RESOLVED", "CLOSED"],
                            example: "PENDING"
                        }
                    }
                },

                AssignTicketRequest: {
                    type: "object",
                    required: ["assignedToUserId"],
                    properties: {
                        assignedToUserId: {
                            type: "string",
                            example: "680ab1234c56d7890ef67890"
                        }
                    }
                },

                CreateTicketMessageRequest: {
                    type: "object",
                    required: ["content"],
                    properties: {
                        content: {
                            type: "string",
                            example: "We are currently investigating this ticket."
                        }
                    }
                },

                CreateInvitationRequest: {
                    type: "object",
                    required: ["email", "firstName", "lastName", "roleId"],
                    properties: {
                        email: {
                            type: "string",
                            example: "invitee@example.com",
                        },
                        firstName: {
                            type: "string",
                            example: "Jane",
                        },
                        lastName: {
                            type: "string",
                            example: "Doe",
                        },
                        roleId: {
                            type: "string",
                            example: "680ab1234c56d7890ef67890",
                        },
                    },
                },

                AcceptInvitationRequest: {
                    type: "object",
                    required: ["token"],
                    properties: {
                        token: {
                            type: "string",
                            example: "invitation_token_here",
                        },
                    },
                },

                RoleSummary: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            example: "680ab1234c56d7890ef67890",
                        },
                        name: {
                            type: "string",
                            example: "Super Admin",
                        },
                        description: {
                            type: "string",
                            example: "Platform super administrator",
                        },
                        permissions: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            example: ["manage_users", "manage_roles"],
                        },
                    },
                },

                Role: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "680ab1234c56d7890ef67890",
                        },
                        name: {
                            type: "string",
                            example: "Account Officer",
                        },
                        description: {
                            type: "string",
                            example: "Account operations role",
                        },
                        permissions: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            example: ["wallet.read", "wallet.fund", "wallet.update"],
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },

                PaginationMeta: {
                    type: "object",
                    properties: {
                        page: {
                            type: "integer",
                            example: 1
                        },
                        limit: {
                            type: "integer",
                            example: 20
                        },
                        total: {
                            type: "integer",
                            example: 1
                        },
                        totalPages: {
                            type: "integer",
                            example: 1
                        }
                    }
                },

                TicketUserReference: {
                    type: "object",
                    nullable: true,
                    properties: {
                        userId: {
                            type: "string",
                            example: "680ab1234c56d7890ef67890"
                        },
                        name: {
                            type: "string",
                            example: "Jane Doe"
                        },
                        email: {
                            type: "string",
                            example: "jane.doe@example.com"
                        }
                    }
                },

                TicketMessage: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            example: "1f0bb464-3d9d-4e10-8b45-466efbe32b52"
                        },
                        ticketId: {
                            type: "string",
                            example: "TKT-20260420-A1B2C3"
                        },
                        sender: {
                            $ref: "#/components/schemas/TicketUserReference"
                        },
                        type: {
                            type: "string",
                            enum: ["message", "internal_note"],
                            example: "message"
                        },
                        content: {
                            type: "string",
                            example: "We are currently investigating this ticket."
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time"
                        }
                    }
                },

                Ticket: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            example: "1f0bb464-3d9d-4e10-8b45-466efbe32b52"
                        },
                        ticketId: {
                            type: "string",
                            example: "TKT-20260420-A1B2C3"
                        },
                        title: {
                            type: "string",
                            example: "Wallet funding issue"
                        },
                        description: {
                            type: "string",
                            example: "Customer wallet funding is failing on the mobile app."
                        },
                        status: {
                            type: "string",
                            enum: ["OPEN", "PENDING", "RESOLVED", "CLOSED"],
                            example: "OPEN"
                        },
                        priority: {
                            type: "string",
                            enum: ["LOW", "MEDIUM", "HIGH"],
                            example: "MEDIUM"
                        },
                        assignedTo: {
                            $ref: "#/components/schemas/TicketUserReference"
                        },
                        createdBy: {
                            $ref: "#/components/schemas/TicketUserReference"
                        },
                        updatedBy: {
                            $ref: "#/components/schemas/TicketUserReference"
                        },
                        messages: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/TicketMessage"
                            }
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time"
                        }
                    }
                },

                User: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                        },
                        email: {
                            type: "string",
                        },
                        firstName: {
                            type: "string",
                        },
                        lastName: {
                            type: "string",
                        },
                        status: {
                            type: "string",
                            example: "active",
                        },
                        emailVerified: {
                            type: "boolean",
                        },
                        emailVerifiedAt: {
                            type: "string",
                            format: "date-time",
                            nullable: true,
                        },
                        mustChangePassword: {
                            type: "boolean",
                        },
                        invitedBy: {
                            type: "string",
                            nullable: true,
                        },
                        roleId: {
                            type: "string",
                            nullable: true,
                        },
                        role: {
                            $ref: "#/components/schemas/RoleSummary",
                        },
                        deniedPermissions: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                        },
                        allowedPermissions: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                        },
                        phoneNumber: {
                            type: "string",
                        },
                        profileImage: {
                            type: "string",
                        },
                        metadata: {
                            type: "object",
                            additionalProperties: true,
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },

                InvitationRecord: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                        },
                        userId: {
                            type: "string",
                        },
                        email: {
                            type: "string",
                        },
                        firstName: {
                            type: "string",
                        },
                        lastName: {
                            type: "string",
                        },
                        roleId: {
                            type: "string",
                        },
                        invitedBy: {
                            type: "string",
                        },
                        status: {
                            type: "string",
                            example: "pending",
                        },
                        expiresAt: {
                            type: "string",
                            format: "date-time",
                        },
                        acceptedAt: {
                            type: "string",
                            format: "date-time",
                            nullable: true,
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },

                InvitationPreview: {
                    type: "object",
                    properties: {
                        email: {
                            type: "string",
                        },
                        firstName: {
                            type: "string",
                        },
                        lastName: {
                            type: "string",
                        },
                        expiresAt: {
                            type: "string",
                            format: "date-time",
                        },
                        invitationStatus: {
                            type: "string",
                            example: "pending",
                        },
                        role: {
                            $ref: "#/components/schemas/RoleSummary",
                        },
                        user: {
                            type: "object",
                            nullable: true,
                            properties: {
                                id: {
                                    type: "string",
                                },
                                roleId: {
                                    type: "string",
                                    nullable: true,
                                },
                                emailVerified: {
                                    type: "boolean",
                                },
                                status: {
                                    type: "string",
                                },
                                mustChangePassword: {
                                    type: "boolean",
                                },
                            },
                        },
                    },
                },

                UserResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true,
                        },
                        message: {
                            type: "string",
                        },
                        data: {
                            type: "object",
                            properties: {
                                user: {
                                    $ref: "#/components/schemas/User",
                                },
                            },
                        },
                    },
                },

                UserListResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true,
                        },
                        message: {
                            type: "string",
                            example: "Users fetched successfully",
                        },
                        data: {
                            type: "object",
                            properties: {
                                users: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/User",
                                    },
                                },
                            },
                        },
                    },
                },

                AuthResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true,
                        },
                        message: {
                            type: "string",
                            example: "Login successful",
                        },
                        data: {
                            type: "object",
                            properties: {
                                user: {
                                    $ref: "#/components/schemas/User",
                                },
                                accessToken: {
                                    type: "string",
                                },
                                refreshToken: {
                                    type: "string",
                                },
                            },
                        },
                    },
                },

                RefreshTokenResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true,
                        },
                        message: {
                            type: "string",
                            example: "Token refreshed successfully",
                        },
                        data: {
                            type: "object",
                            properties: {
                                accessToken: {
                                    type: "string",
                                },
                                refreshToken: {
                                    type: "string",
                                },
                            },
                        },
                    },
                },

                RoleResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true,
                        },
                        message: {
                            type: "string",
                            example: "Role created successfully",
                        },
                        data: {
                            type: "object",
                            properties: {
                                role: {
                                    $ref: "#/components/schemas/Role",
                                },
                            },
                        },
                    },
                },

                RoleListResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true,
                        },
                        message: {
                            type: "string",
                            example: "Role fetched successfully",
                        },
                        data: {
                            type: "object",
                            properties: {
                                roles: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Role",
                                    },
                                },
                            },
                        },
                    },
                },

                TicketResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true
                        },
                        message: {
                            type: "string",
                            example: "Ticket fetched successfully"
                        },
                        data: {
                            type: "object",
                            properties: {
                                ticket: {
                                    $ref: "#/components/schemas/Ticket"
                                }
                            }
                        }
                    }
                },

                TicketListResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true
                        },
                        message: {
                            type: "string",
                            example: "Tickets fetched successfully"
                        },
                        data: {
                            type: "object",
                            properties: {
                                tickets: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Ticket"
                                    }
                                }
                            }
                        },
                        meta: {
                            $ref: "#/components/schemas/PaginationMeta"
                        }
                    }
                },

                TicketMessageResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true
                        },
                        message: {
                            type: "string",
                            example: "Message sent successfully"
                        },
                        data: {
                            type: "object",
                            properties: {
                                message: {
                                    $ref: "#/components/schemas/TicketMessage"
                                },
                                note: {
                                    $ref: "#/components/schemas/TicketMessage"
                                }
                            }
                        }
                    }
                },

                TicketMessageListResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true
                        },
                        message: {
                            type: "string",
                            example: "Messages fetched successfully"
                        },
                        data: {
                            type: "object",
                            properties: {
                                messages: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/TicketMessage"
                                    }
                                },
                                notes: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/TicketMessage"
                                    }
                                }
                            }
                        },
                        meta: {
                            $ref: "#/components/schemas/PaginationMeta"
                        }
                    }
                },

                InvitationResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true,
                        },
                        message: {
                            type: "string",
                            example: "Invitation sent successfully",
                        },
                        data: {
                            type: "object",
                            properties: {
                                invitation: {
                                    $ref: "#/components/schemas/InvitationRecord",
                                },
                            },
                        },
                    },
                },

                InvitationPreviewResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true,
                        },
                        message: {
                            type: "string",
                            example: "Invitation fetched successfully",
                        },
                        data: {
                            $ref: "#/components/schemas/InvitationPreview",
                        },
                    },
                },

                InvitationActivationResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true,
                        },
                        message: {
                            type: "string",
                            example:
                                "Invitation accepted successfully. You can now log in with your temporary password.",
                        },
                        data: {
                            $ref: "#/components/schemas/InvitationPreview",
                        },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ["src/modules/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;

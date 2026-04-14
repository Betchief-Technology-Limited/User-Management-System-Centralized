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
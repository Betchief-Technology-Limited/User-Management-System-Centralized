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
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
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
              example: "Role already exists",
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

        CreateUserRequest: {
          type: "object",
          required: ["email", "password", "firstName", "lastName"],
          properties: {
            email: {
              type: "string",
              example: "staff@example.com",
            },
            password: {
              type: "string",
              example: "password123",
            },
            firstName: {
              type: "string",
              example: "John",
            },
            lastName: {
              type: "string",
              example: "Doe",
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
              example: {
                department: "Engineering",
              },
            },
          },
        },

        UpdateUserStatusRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["active", "inactive", "suspended"],
              example: "inactive",
            },
          },
        },

        CreateRoleRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              example: "Account",
            },
            description: {
              type: "string",
              example: "Account management role",
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
              example: "Super Admin",
            },
            description: {
              type: "string",
              example: "Platform super administrator",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-04-11T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-04-11T10:00:00.000Z",
            },
          },
        },

        Permission: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "680ab1234c56d7890ef12345",
            },
            name: {
              type: "string",
              example: "manage_roles",
            },
            description: {
              type: "string",
              example: "manage_roles permission",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-04-11T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-04-11T10:00:00.000Z",
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
              example: "Roles fetched successfully",
            },
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Role",
              },
            },
          },
        },

        PermissionListResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Permissions fetched successfully",
            },
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Permission",
              },
            },
          },
        },
        
        CreatePermissionRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              example: "wallet.read",
            },
            description: {
              type: "string",
              example: "Can read wallet records",
            },
          },
        },

        AssignPermissionToRoleRequest: {
          type: "object",
          required: ["permissionId"],
          properties: {
            permissionId: {
              type: "string",
              example: "680ab1234c56d7890ef12345",
            },
          },
        },

        AssignRoleToUserRequest: {
          type: "object",
          required: ["userId", "roleId"],
          properties: {
            userId: {
              type: "string",
              example: "680ab1234c56d7890ef12345",
            },
            roleId: {
              type: "string",
              example: "680ab1234c56d7890ef67890",
            },
          },
        },

        CreateInvitationRequest: {
          type: "object",
          required: ["email", "roleId"],
          properties: {
            email: {
              type: "string",
              example: "invitee@example.com",
            },
            roleId: {
              type: "string",
              example: "680ab1234c56d7890ef67890",
            },
          },
        },

        AcceptInvitationRequest: {
          type: "object",
          required: ["token", "firstName", "lastName", "password"],
          properties: {
            token: {
              type: "string",
              example: "invitation_token_here",
            },
            firstName: {
              type: "string",
              example: "Jane",
            },
            lastName: {
              type: "string",
              example: "Doe",
            },
            password: {
              type: "string",
              example: "password123",
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
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

        ChangePasswordRequest: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: {
              type: "string",
              example: "temporaryPassword123",
            },
            newPassword: {
              type: "string",
              example: "MySecurePassword123",
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
          required: ["permissionIds"],
          properties: {
            permissionIds: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["680ab1234c56d7890ef12345"],
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

        RolePermission: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "680ab1234c56d7890ef99999",
            },
            roleId: {
              type: "string",
              example: "680ab1234c56d7890ef67890",
            },
            permissionId: {
              type: "string",
              example: "680ab1234c56d7890ef12345",
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
            permissions: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Permission",
              },
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

        UserRoleSummary: {
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
            assignedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        UserRoleAssignment: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            userId: {
              type: "string",
            },
            roleId: {
              type: "string",
            },
            organizationId: {
              type: "string",
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
            roles: {
              type: "array",
              items: {
                $ref: "#/components/schemas/UserRoleSummary",
              },
            },
            permissions: {
              type: "array",
              items: {
                type: "string",
              },
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
              type: "object",
              nullable: true,
              properties: {
                id: {
                  type: "string",
                },
                name: {
                  type: "string",
                },
                description: {
                  type: "string",
                },
              },
            },
            user: {
              type: "object",
              nullable: true,
              properties: {
                id: {
                  type: "string",
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

        PermissionResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Permission created successfully",
            },
            data: {
              type: "object",
              properties: {
                permission: {
                  $ref: "#/components/schemas/Permission",
                },
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
              type: "object",
              properties: {
                permissions: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Permission",
                  },
                },
              },
            },
          },
        },

        RolePermissionAssignmentResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Permissions assigned to role successfully",
            },
            data: {
              type: "object",
              properties: {
                rolePermissions: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/RolePermission",
                  },
                },
              },
            },
          },
        },

        UserRoleAssignmentResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Role assigned to user successfully",
            },
            data: {
              type: "object",
              properties: {
                userRole: {
                  $ref: "#/components/schemas/UserRoleAssignment",
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
                "Invitation activated successfully. You can now log in with your temporary password.",
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
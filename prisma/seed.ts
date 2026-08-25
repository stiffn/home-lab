import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaMssql({
  server: process.env.DB_SERVER!,
  port: Number(process.env.DB_PORT!),
  database: process.env.DB_NAME!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,

  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
});

const prisma = new PrismaClient({
  adapter,
});

const permissions = [
  // Authentication
  {
    name: "auth.login",
    description: "Log in to the system",
  },
  {
    name: "auth.logout",
    description: "Log out of the system",
  },
  {
    name: "auth.change-password",
    description: "Change the current user's password",
  },
  {
    name: "auth.reset-password",
    description: "Reset a user's password",
  },

  // Users
  {
    name: "users.create",
    description: "Create a new user",
  },
  {
    name: "users.read",
    description: "View user information",
  },
  {
    name: "users.update",
    description: "Update user information",
  },
  {
    name: "users.delete",
    description: "Delete a user",
  },
  {
    name: "users.activate",
    description: "Activate a user account",
  },
  {
    name: "users.deactivate",
    description: "Deactivate a user account",
  },

  // Roles
  {
    name: "roles.create",
    description: "Create a new role",
  },
  {
    name: "roles.read",
    description: "View roles",
  },
  {
    name: "roles.update",
    description: "Update a role",
  },
  {
    name: "roles.delete",
    description: "Delete a role",
  },
  {
    name: "roles.assign",
    description: "Assign roles to users",
  },

  // Permissions
  {
    name: "permissions.create",
    description: "Create a new permission",
  },
  {
    name: "permissions.read",
    description: "View permissions",
  },
  {
    name: "permissions.update",
    description: "Update a permission",
  },
  {
    name: "permissions.delete",
    description: "Delete a permission",
  },
  {
    name: "permissions.assign",
    description: "Assign permissions to roles",
  },

  // User Types
  {
    name: "user-types.create",
    description: "Create a new user type",
  },
  {
    name: "user-types.read",
    description: "View user types",
  },
  {
    name: "user-types.update",
    description: "Update a user type",
  },
  {
    name: "user-types.delete",
    description: "Delete a user type",
  },
];

async function main() {
  console.log("Seeding permissions...");

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        name: permission.name,
      },
      update: {
        description: permission.description,
      },
      create: permission,
    });
  }

  console.log(`Seeded ${permissions.length} permissions.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

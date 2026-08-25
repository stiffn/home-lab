import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),

  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),

  userTypeId: z.string().uuid(),
  roleIds: z.array(z.string().uuid()).min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request",
          errors: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      userTypeId,
      roleIds,
    } = result.data;

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "Username already exists",
        },
        { status: 409 },
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already exists",
        },
        { status: 409 },
      );
    }

    // Verify UserType exists
    const userType = await prisma.userType.findUnique({
      where: {
        id: userTypeId,
      },
    });

    if (!userType) {
      return NextResponse.json(
        {
          success: false,
          message: "User type not found",
        },
        { status: 404 },
      );
    }

    // Verify roles exist
    const roles = await prisma.role.findMany({
      where: {
        id: {
          in: roleIds,
        },
      },
    });

    if (roles.length !== roleIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more roles were not found",
        },
        { status: 404 },
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and roles in one transaction
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        userTypeId,

        roles: {
          create: roleIds.map((roleId) => ({
            roleId,
          })),
        },
      },

      include: {
        userType: true,

        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          roles: user.roles.map((userRole) => userRole.role),
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}

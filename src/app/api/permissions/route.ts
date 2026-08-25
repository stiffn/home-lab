import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const createPermissionSchema = z.object({
  name: z
    .string()
    .min(2, "Permission name must be at least 2 characters")
    .max(100, "Permission name must not exceed 100 characters"),

  description: z
    .string()
    .max(255, "Description must not exceed 255 characters")
    .optional()
    .nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = createPermissionSchema.safeParse(body);

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

    const { name, description } = result.data;

    // Check if permission already exists
    const existingPermission = await prisma.permission.findUnique({
      where: {
        name,
      },
    });

    if (existingPermission) {
      return NextResponse.json(
        {
          success: false,
          message: "Permission already exists",
        },
        { status: 409 },
      );
    }

    // Create permission
    const permission = await prisma.permission.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Permission created successfully",
        data: permission,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create permission error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: permissions,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get permissions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}

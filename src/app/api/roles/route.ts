import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const createRoleSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(255).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = createRoleSchema.safeParse(body);

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

    const existingRole = await prisma.role.findUnique({
      where: {
        name,
      },
    });

    if (existingRole) {
      return NextResponse.json(
        {
          success: false,
          message: "Role already exists",
        },
        { status: 409 },
      );
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Role created successfully",
        data: role,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create role error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}

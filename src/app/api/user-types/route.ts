import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const createUserTypeSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(255).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = createUserTypeSchema.safeParse(body);

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

    const existingUserType = await prisma.userType.findUnique({
      where: {
        name,
      },
    });

    if (existingUserType) {
      return NextResponse.json(
        {
          success: false,
          message: "User type already exists",
        },
        { status: 409 },
      );
    }

    const userType = await prisma.userType.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User type created successfully",
        data: userType,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create user type error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}

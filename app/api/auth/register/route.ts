import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withValidation } from "@/lib/validate";
import { registerBodySchema } from "@/lib/validators/auth";

export const POST = withValidation({ body: registerBodySchema }, async (_request, { body }) => {
  try {
    const { name, email, password } = body;

    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Email is already registered.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 12);

    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Registration error", error);

    return NextResponse.json(
      {
        error: "Failed to register user.",
      },
      { status: 500 },
    );
  }
});

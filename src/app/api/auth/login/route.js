// src/app/api/auth/login/route.js
// ─── User Login Endpoint ──────────────────────────────────────
// POST: Validates email + password, returns JWT token + user data.

import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    // Step 1: Get email and password from the request body
    const body = await request.json();
    const { email, password } = body;

    // Step 2: Check if email and password were provided
    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    // Step 3: Find the user in the database by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Step 4: If no user found, return error
    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    // Step 5: Compare the password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return errorResponse("Invalid email or password", 401);
    }

    // Step 6: Create a JWT token with user info
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Step 7: Return the token and user data (never return the password!)
    return successResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Login Error]:", error);
    return errorResponse("Login failed. Please try again.", 500);
  }
}

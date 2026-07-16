// src/app/api/auth/me/route.js
// ─── Get Current User Endpoint ────────────────────────────────
// GET: Returns the currently logged-in user's info from their JWT token.

import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET(request) {
  try {
    // Step 1: Get the user from the JWT token in the Authorization header
    const authUser = getAuthUser(request);

    // Step 2: If no valid token, return 401
    if (!authUser) {
      return errorResponse("Not authenticated. Please log in.", 401);
    }

    // Step 3: Get fresh user data from the database (with their skills)
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        location: true,
        phone: true,
        createdAt: true,
        skills: true,
        // Count how many jobs/applications they have
        _count: {
          select: {
            jobs: true,
            applications: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse(user);
  } catch (error) {
    console.error("[Me Error]:", error);
    return errorResponse("Failed to get user info", 500);
  }
}

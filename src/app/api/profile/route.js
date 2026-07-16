// src/app/api/profile/route.js
// ─── Profile API ──────────────────────────────────────────────
// GET: Get current user's full profile with skills and stats
// PUT: Update profile info (name, bio, location, phone, skills)

import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api";

// ─── GET: Get current user's profile ──────────────────────────
export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return errorResponse("Please log in", 401);
    }

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
    console.error("[Profile GET Error]:", error);
    return errorResponse("Failed to get profile", 500);
  }
}

// ─── PUT: Update profile ──────────────────────────────────────
export async function PUT(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return errorResponse("Please log in", 401);
    }

    const body = await request.json();
    const { name, bio, location, phone, skills } = body;

    // Update the user's basic info
    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        name: name || undefined,
        bio: bio || null,
        location: location || null,
        phone: phone || null,
      },
    });

    // If skills array was provided, replace all skills
    if (skills !== undefined && Array.isArray(skills)) {
      // Delete old skills
      await prisma.skill.deleteMany({
        where: { userId: authUser.id },
      });

      // Create new skills (only non-empty strings)
      const skillsToCreate = skills
        .filter((s) => typeof s === "string" && s.trim() !== "")
        .map((name) => ({
          name: name.trim(),
          userId: authUser.id,
        }));

      if (skillsToCreate.length > 0) {
        await prisma.skill.createMany({
          data: skillsToCreate,
        });
      }
    }

    // Return the updated user with skills
    const fullUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        location: true,
        phone: true,
        skills: true,
        _count: {
          select: { jobs: true, applications: true },
        },
      },
    });

    return successResponse(fullUser);
  } catch (error) {
    console.error("[Profile PUT Error]:", error);
    return errorResponse("Failed to update profile", 500);
  }
}

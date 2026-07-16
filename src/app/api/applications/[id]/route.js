// src/app/api/applications/[id]/route.js
// ─── Single Application API ──────────────────────────────────
// PATCH: Update application status (employer only, for their own job listings)

import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api";

export async function PATCH(request, { params }) {
  try {
    // Step 1: Check authentication
    const authUser = getAuthUser(request);
    if (!authUser) {
      return errorResponse("Please log in", 401);
    }

    // Step 2: Only employers can update application status
    if (authUser.role !== "EMPLOYER") {
      return errorResponse("Only employers can update application status", 403);
    }

    // Step 3: Get the application ID from the URL
    const { id } = await params;
    const applicationId = parseInt(id);

    if (isNaN(applicationId)) {
      return errorResponse("Invalid application ID", 400);
    }

    // Step 4: Find the application and check if it belongs to the employer's job
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: { select: { employerId: true } },
      },
    });

    if (!application) {
      return errorResponse("Application not found", 404);
    }

    // Step 5: Make sure this employer owns the job
    if (application.job.employerId !== authUser.id) {
      return errorResponse("You can only update applications for your own jobs", 403);
    }

    // Step 6: Get the new status
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"];
    if (!status || !validStatuses.includes(status)) {
      return errorResponse(
        "Status must be one of: PENDING, REVIEWED, ACCEPTED, REJECTED",
        400
      );
    }

    // Step 7: Update the application
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        seeker: {
          select: { id: true, name: true, email: true },
        },
        job: {
          select: { id: true, title: true },
        },
      },
    });

    return successResponse(updated);
  } catch (error) {
    console.error("[Application PATCH Error]:", error);
    return errorResponse("Failed to update application", 500);
  }
}

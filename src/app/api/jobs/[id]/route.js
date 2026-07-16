// src/app/api/jobs/[id]/route.js
// ─── Single Job API ──────────────────────────────────────────
// GET: Get a single job by its ID, including employer info and application count.

import { prisma } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET(request, { params }) {
  try {
    // Get the job ID from the URL (e.g., /api/jobs/5 → id = "5")
    const { id } = await params;
    const jobId = parseInt(id);

    // Check if the ID is a valid number
    if (isNaN(jobId)) {
      return errorResponse("Invalid job ID", 400);
    }

    // Find the job in the database
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        employer: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    // If job not found, return 404
    if (!job) {
      return errorResponse("Job not found", 404);
    }

    return successResponse(job);
  } catch (error) {
    console.error("[Job GET Error]:", error);
    return errorResponse("Failed to fetch job", 500);
  }
}

// src/app/api/applications/route.js
// ─── Applications API ────────────────────────────────────────
// GET:  List applications (seeker sees their own, employer sees apps for their jobs)
// POST: Submit a new application (seeker only)

import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api";

// ─── GET: List applications ───────────────────────────────────
export async function GET(request) {
  try {
    // Step 1: Check authentication
    const authUser = getAuthUser(request);
    if (!authUser) {
      return errorResponse("Please log in to view applications", 401);
    }

    let applications;

    if (authUser.role === "SEEKER") {
      // Seekers see their own applications with job details
      applications = await prisma.application.findMany({
        where: { seekerId: authUser.id },
        orderBy: { createdAt: "desc" },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              location: true,
              type: true,
              salary: true,
            },
          },
        },
      });
    } else {
      // Employers see applications for their posted jobs
      applications = await prisma.application.findMany({
        where: {
          job: { employerId: authUser.id },
        },
        orderBy: { createdAt: "desc" },
        include: {
          seeker: {
            select: { id: true, name: true, email: true },
          },
          job: {
            select: { id: true, title: true, company: true },
          },
        },
      });
    }

    return successResponse(applications);
  } catch (error) {
    console.error("[Applications GET Error]:", error);
    return errorResponse("Failed to fetch applications", 500);
  }
}

// ─── POST: Submit an application ──────────────────────────────
export async function POST(request) {
  try {
    // Step 1: Check authentication
    const authUser = getAuthUser(request);
    if (!authUser) {
      return errorResponse("Please log in to apply", 401);
    }

    // Step 2: Only seekers can apply
    if (authUser.role !== "SEEKER") {
      return errorResponse("Only job seekers can apply to jobs", 403);
    }

    // Step 3: Get application data
    const body = await request.json();
    const { jobId, coverLetter } = body;

    if (!jobId) {
      return errorResponse("Job ID is required", 400);
    }

    // Step 4: Check if the job exists
    const job = await prisma.job.findUnique({
      where: { id: parseInt(jobId) },
    });

    if (!job) {
      return errorResponse("Job not found", 404);
    }

    // Step 5: Check if already applied (the @@unique constraint will also catch this)
    const existing = await prisma.application.findUnique({
      where: {
        seekerId_jobId: {
          seekerId: authUser.id,
          jobId: parseInt(jobId),
        },
      },
    });

    if (existing) {
      return errorResponse("You have already applied to this job", 409);
    }

    // Step 6: Create the application
    const application = await prisma.application.create({
      data: {
        seekerId: authUser.id,
        jobId: parseInt(jobId),
        coverLetter: coverLetter || null,
      },
      include: {
        job: {
          select: { id: true, title: true, company: true },
        },
      },
    });

    return successResponse(application, 201);
  } catch (error) {
    console.error("[Applications POST Error]:", error);
    return errorResponse("Failed to submit application", 500);
  }
}

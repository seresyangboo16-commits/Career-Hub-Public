import {errorResponse, successResponse} from "@/app/api/response";

export async function POST(request) {
  const body = await request.json();
  return successResponse({ message: "Job created successfully", data: body });
}
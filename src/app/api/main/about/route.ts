import { NextRequest, NextResponse } from "next/server";
import { MainApi } from "@/lib/api/main";

export async function GET(request: NextRequest) {
  try {
    const response = await MainApi.getAboutContent();
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch about content" },
      { status: 500 }
    );
  }
}

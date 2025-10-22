import { NextRequest, NextResponse } from "next/server";
import { MainApi } from "@/lib/api/main";

export async function GET(request: NextRequest) {
  try {
    const response = await MainApi.getHomePageData();
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch home page data" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { MainApi } from "@/lib/api/main";

export async function GET(request: NextRequest) {
  try {
    const response = await MainApi.getGrowers();
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch growers" },
      { status: 500 }
    );
  }
}

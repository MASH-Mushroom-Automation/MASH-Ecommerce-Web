import { NextRequest, NextResponse } from "next/server";
import { UserApi } from "@/lib/api/user";

export async function GET(request: NextRequest) {
  try {
    const response = await UserApi.getProfile();
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const profile = await request.json();
    const response = await UserApi.updateProfile(profile);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

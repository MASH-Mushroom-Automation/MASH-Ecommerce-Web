import { NextRequest, NextResponse } from "next/server";
import { UserApi } from "@/lib/api/user";

export async function GET(request: NextRequest) {
  try {
    const response = await UserApi.getOnboardingData();
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch onboarding data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const response = await UserApi.updateOnboardingData(data);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update onboarding data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const response = await UserApi.completeOnboarding();
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}

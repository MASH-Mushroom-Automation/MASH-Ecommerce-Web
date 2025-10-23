import { NextRequest, NextResponse } from "next/server";
import { SellerApi } from "@/lib/api/seller";

export async function GET(request: NextRequest) {
  try {
    const response = await SellerApi.getNotifications();
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    const response = await SellerApi.markNotificationAsRead(id);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}

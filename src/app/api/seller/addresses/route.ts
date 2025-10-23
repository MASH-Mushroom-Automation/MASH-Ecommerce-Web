import { NextRequest, NextResponse } from "next/server";
import { SellerApi } from "@/lib/api/seller";

export async function GET(request: NextRequest) {
  try {
    const response = await SellerApi.getAddresses();
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const address = await request.json();
    const response = await SellerApi.createAddress(address);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...address } = await request.json();
    const response = await SellerApi.updateAddress(id, address);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      );
    }

    const response = await SellerApi.deleteAddress(id);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}

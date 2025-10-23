import { NextRequest, NextResponse } from "next/server";
import { SellerApi } from "@/lib/api/seller";

export async function GET(request: NextRequest) {
  try {
    const [statsResponse, salesResponse, performanceResponse] =
      await Promise.all([
        SellerApi.getDashboardStats(),
        SellerApi.getSalesData(),
        SellerApi.getProductPerformance(),
      ]);

    return NextResponse.json({
      stats: statsResponse.data,
      salesData: salesResponse.data,
      productPerformance: performanceResponse.data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

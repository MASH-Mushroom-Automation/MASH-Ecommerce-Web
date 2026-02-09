import { NextRequest, NextResponse } from "next/server";

interface TopPerformingProduct {
  productId: string;
  productName: string;
  unitsSold: number;
  stock: number;
  revenue: number;
  price: number;
  imageUrl?: string;
  orderCount: number;
}

interface TopPerformingProductsResponse {
  data: TopPerformingProduct[];
  meta: {
    total: number;
    limit: number;
    orderBy: "revenue" | "units";
  };
}

const MOCK_TOP_PRODUCTS: TopPerformingProduct[] = [
  {
    productId: "P-101",
    productName: "Fresh White Oyster Mushrooms",
    unitsSold: 120,
    stock: 50,
    revenue: 14400,
    price: 120,
    imageUrl: "/white.jpg",
    orderCount: 65,
  },
  {
    productId: "P-102",
    productName: "Mushroom Chips",
    unitsSold: 85,
    stock: 30,
    revenue: 11900,
    price: 140,
    imageUrl: "/Pink-Oyster-1.webp",
    orderCount: 42,
  },
  {
    productId: "P-103",
    productName: "Shiitake Mushroom Pack",
    unitsSold: 60,
    stock: 18,
    revenue: 9900,
    price: 165,
    orderCount: 31,
  },
  {
    productId: "P-104",
    productName: "Lion's Mane Capsules",
    unitsSold: 40,
    stock: 12,
    revenue: 7600,
    price: 190,
    orderCount: 18,
  },
  {
    productId: "P-105",
    productName: "Reishi Powder",
    unitsSold: 32,
    stock: 22,
    revenue: 6400,
    price: 200,
    orderCount: 14,
  },
];

function getSortedProducts(orderBy: "revenue" | "units"): TopPerformingProduct[] {
  const sorted = [...MOCK_TOP_PRODUCTS];
  if (orderBy === "units") {
    return sorted.sort((a, b) => b.unitsSold - a.unitsSold);
  }
  return sorted.sort((a, b) => b.revenue - a.revenue);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit")) || 10;
  const orderBy = (searchParams.get("orderBy") as "revenue" | "units") || "revenue";

  // For local development, return mock data to avoid backend 404s
  if (process.env.NODE_ENV !== "production") {
    const data = getSortedProducts(orderBy).slice(0, limit);

    const response: TopPerformingProductsResponse = {
      data,
      meta: {
        total: data.length,
        limit,
        orderBy,
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30000/api/v1";
  const url = `${apiBaseUrl}/admin/products/top-performing?limit=${limit}&orderBy=${orderBy}`;

  try {
    const backendResponse = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          data: getSortedProducts(orderBy).slice(0, limit),
          meta: {
            total: Math.min(limit, MOCK_TOP_PRODUCTS.length),
            limit,
            orderBy,
          },
        } satisfies TopPerformingProductsResponse,
        { status: 200 }
      );
    }

    const data = (await backendResponse.json()) as TopPerformingProductsResponse;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        data: getSortedProducts(orderBy).slice(0, limit),
        meta: {
          total: Math.min(limit, MOCK_TOP_PRODUCTS.length),
          limit,
          orderBy,
        },
      } satisfies TopPerformingProductsResponse,
      { status: 200 }
    );
  }
}

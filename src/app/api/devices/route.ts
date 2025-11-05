import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

// Mock IoT devices data (fallback)
const MOCK_DEVICES = [
  {
    id: "dev_001",
    name: "Growing Kit #1",
    type: "mushroom_kit",
    model: "MASH-GK-001",
    status: "online",
    lastSeen: new Date().toISOString(),
    location: "Living Room",
    firmware: "v2.1.0",
    sensors: {
      temperature: {
        value: 26.5,
        unit: "°C",
        status: "normal",
        lastReading: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      humidity: {
        value: 85,
        unit: "%",
        status: "normal",
        lastReading: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      co2: {
        value: 12500,
        unit: "ppm",
        status: "normal",
        lastReading: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      }
    },
    actuators: {
      humidifier: {
        status: "on",
        power: 75,
        mode: "auto"
      },
      fan: {
        status: "on",
        speed: 50,
        mode: "auto"
      },
      heater: {
        status: "off",
        targetTemp: 27
      }
    },
    alerts: [
      {
        id: "alert_001",
        type: "info",
        message: "Fruiting phase started",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    configuration: {
      targetTemperature: { min: 25, max: 28 },
      targetHumidity: { min: 80, max: 90 },
      targetCO2: { min: 10000, max: 15000 },
      autoMode: true,
      notifications: true
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "dev_002",
    name: "Growing Kit #2",
    type: "mushroom_kit",
    model: "MASH-GK-001",
    status: "offline",
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    location: "Kitchen",
    firmware: "v2.0.5",
    sensors: {
      temperature: {
        value: 24.2,
        unit: "°C",
        status: "low",
        lastReading: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      humidity: {
        value: 75,
        unit: "%",
        status: "low",
        lastReading: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      co2: {
        value: 9500,
        unit: "ppm",
        status: "low",
        lastReading: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    },
    actuators: {
      humidifier: {
        status: "off",
        power: 0,
        mode: "manual"
      },
      fan: {
        status: "off",
        speed: 0,
        mode: "manual"
      },
      heater: {
        status: "off",
        targetTemp: 25
      }
    },
    alerts: [
      {
        id: "alert_002",
        type: "warning",
        message: "Device offline for 2 hours",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    configuration: {
      targetTemperature: { min: 25, max: 28 },
      targetHumidity: { min: 80, max: 90 },
      targetCO2: { min: 10000, max: 15000 },
      autoMode: false,
      notifications: true
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

// Get user's devices
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required"
          }
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = new URLSearchParams();
    if (searchParams.get("status")) queryParams.append("status", searchParams.get("status")!);
    if (searchParams.get("type")) queryParams.append("type", searchParams.get("type")!);
    if (searchParams.get("page")) queryParams.append("page", searchParams.get("page")!);
    if (searchParams.get("limit")) queryParams.append("limit", searchParams.get("limit")!);
    
    const query = queryParams.toString();
    const endpoint = query ? `/api/devices?${query}` : "/api/devices";
    const response = await apiRequest<ApiResponse<any>>(endpoint, { method: "GET" });

    return NextResponse.json({ ...response, timestamp: new Date().toISOString(), requestId: `req_${Date.now()}` });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "Failed to fetch devices"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Register new device
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required"
          }
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const response = await apiRequest<ApiResponse<any>>("/api/devices", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json({ ...response, timestamp: new Date().toISOString(), requestId: `req_${Date.now()}` }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REGISTER_ERROR",
          message: error instanceof Error ? error.message : "Failed to register device"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

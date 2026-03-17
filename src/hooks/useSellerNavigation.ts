import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface SellerStatusResponse {
  hasPendingRequest: boolean;
  status: "none" | "pending" | "approved" | "rejected";
  requestId?: string;
  submittedAt?: Date;
}

type SellerStatusEnvelope = {
  data?: SellerStatusResponse;
  success?: boolean;
  statusCode?: number;
};

function normalizeSellerStatus(
  payload: SellerStatusResponse | SellerStatusEnvelope,
): SellerStatusResponse {
  const maybeEnvelope = payload as SellerStatusEnvelope;
  if (maybeEnvelope && typeof maybeEnvelope === "object" && maybeEnvelope.data) {
    return maybeEnvelope.data;
  }
  return payload as SellerStatusResponse;
}

export function useSellerNavigation() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSellerButtonClick = async () => {
    if (!user) {
      router.push("/start-selling");
      return;
    }

    try {
      // Check admin role first (JWT-based)
      const roleRes = await fetch("/api/auth/get-role", {
        method: "GET",
        credentials: "include",
      });
      if (roleRes.ok) {
        const roleData: { role?: string | null } = await roleRes.json();
        const role = (roleData?.role || "").toUpperCase();
        if (role === "ADMIN" || role === "SUPER_ADMIN") {
          router.push("/seller/dashboard");
          return;
        }
      }

      const statusRes = await fetch("/api/seller-status", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const raw = (await statusRes.json()) as
        | SellerStatusResponse
        | SellerStatusEnvelope;
      const res = normalizeSellerStatus(raw);

      switch (res?.status) {
        case "approved":
          router.push("/seller/dashboard");
          break;
        case "pending":
          router.push("/request-pending");
          break;
        case "rejected":
          router.push("/start-selling");
          break;
        default: // "none"
          router.push("/start-selling");
      }
    } catch (error) {
      console.error("Seller status error:", error);
      router.push("/start-selling");
    }
  };

  return { handleSellerButtonClick };
}


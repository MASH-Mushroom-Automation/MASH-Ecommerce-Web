import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api-client";

interface SellerStatusResponse {
  hasPendingRequest: boolean;
  status: "none" | "pending" | "approved" | "rejected";
  requestId?: string;
  submittedAt?: Date;
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
      const res = await apiRequest<SellerStatusResponse>(
        `/seller/my-status`,
        { method: "GET" },
      );

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


// TanStack Query hook for seller application
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { uploadToCloudinary } from "@/lib/cloudinary";

// Types for seller application
export interface SellerApplicationPayload {
  // Location
  city: string;
  region: string;
  completeAddress: string;

  // Business
  businessName: string;
  businessType: string;

  // Products
  mushroomTypes: string[];
  monthlyProductionCapacity: string;
  certifications: string[];

  // Documents (URLs after upload)
  governmentId: string;
  birCertificate: string;
  businessCertificate: string;

  // Optional
  additionalInfo?: string;
}

export interface SellerApplicationResponse {
  success: boolean;
  data?: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    message: string;
    createdAt: string;
  };
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

// API function to submit seller application via Next.js API route (avoids CORS)
async function submitSellerApplication(
  payload: SellerApplicationPayload
): Promise<SellerApplicationResponse> {
  const response = await fetch("/api/user/apply-as-seller", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || data.message || "Failed to submit application"
    );
  }

  return data;
}

// Upload a document to Cloudinary and return the URL
async function uploadDocument(file: File, docType: string): Promise<string> {
  const result = await uploadToCloudinary(file, {
    folder: "seller-applications",
    tags: ["seller-document", docType],
    resourceType: "auto", // Let Cloudinary auto-detect the file type
  });
  return result.secureUrl;
}

// Upload all documents and return URLs
export async function uploadAllDocuments(files: {
  validIdFile: File;
  birCertificateFile: File;
  businessCertificateFile: File;
}): Promise<{
  governmentId: string;
  birCertificate: string;
  businessCertificate: string;
}> {
  const [governmentId, birCertificate, businessCertificate] = await Promise.all(
    [
      uploadDocument(files.validIdFile, "government-id"),
      uploadDocument(files.birCertificateFile, "bir-certificate"),
      uploadDocument(files.businessCertificateFile, "business-certificate"),
    ]
  );

  return { governmentId, birCertificate, businessCertificate };
}

/**
 * TanStack Query mutation hook for seller application
 *
 * @example
 * const { mutateAsync, isPending, isError, error } = useSellerApplicationMutation();
 *
 * const handleSubmit = async (formData) => {
 *   try {
 *     await mutateAsync(formData);
 *     // Success!
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 */
export function useSellerApplicationMutation(): UseMutationResult<
  SellerApplicationResponse,
  Error,
  SellerApplicationPayload
> {
  return useMutation<
    SellerApplicationResponse,
    Error,
    SellerApplicationPayload
  >({
    mutationKey: ["seller-application"],
    mutationFn: submitSellerApplication,
  });
}

/**
 * TanStack Query mutation hook for document upload
 */
export function useDocumentUploadMutation(): UseMutationResult<
  { governmentId: string; birCertificate: string; businessCertificate: string },
  Error,
  { validIdFile: File; birCertificateFile: File; businessCertificateFile: File }
> {
  return useMutation({
    mutationKey: ["document-upload"],
    mutationFn: uploadAllDocuments,
  });
}

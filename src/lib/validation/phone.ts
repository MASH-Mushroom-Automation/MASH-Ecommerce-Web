/**
 * Zod Validation Schemas for Phone Verification
 * 
 * Provides reusable Zod schemas for phone number validation
 * across forms and API endpoints.
 */

import { z } from 'zod';
import { validatePhilippinePhoneNumber } from '@/lib/phone-utils';

/**
 * Phone number validation schema
 * 
 * Requirements:
 * - String type
 * - Min 10 digits (local format without country code)
 * - Max 13 characters (E.164 format with + prefix)
 * - Must be valid Philippine mobile number format
 * 
 * Accepted formats:
 * - +639123456789 (E.164)
 * - 639123456789 (International)
 * - 09123456789 (Local with 0)
 * - 9123456789 (Local without 0)
 * 
 * @example
 * const formSchema = z.object({
 *   phoneNumber: phoneNumberSchema
 * });
 */
export const phoneNumberSchema = z
  .string()
  .min(10, { message: 'Phone number must be at least 10 digits' })
  .max(13, { message: 'Phone number must not exceed 13 characters' })
  .refine(
    (value) => validatePhilippinePhoneNumber(value),
    {
      message: 'Invalid Philippine mobile number format. Must start with valid prefix (e.g., 0912, 0917, 0998)'
    }
  );

/**
 * Optional phone number schema
 * 
 * Allows empty string or valid phone number.
 * Useful for optional fields in forms.
 * 
 * @example
 * const profileSchema = z.object({
 *   alternatePhone: phoneNumberOptionalSchema
 * });
 */
export const phoneNumberOptionalSchema = z
  .string()
  .optional()
  .refine(
    (value) => !value || value === '' || validatePhilippinePhoneNumber(value),
    {
      message: 'Invalid Philippine mobile number format'
    }
  );

/**
 * OTP code validation schema
 * 
 * Requirements:
 * - Exactly 6 digits
 * - No spaces or special characters
 * 
 * @example
 * const verificationSchema = z.object({
 *   code: otpCodeSchema
 * });
 */
export const otpCodeSchema = z
  .string()
  .length(6, { message: 'OTP code must be exactly 6 digits' })
  .regex(/^\d{6}$/, { message: 'OTP code must contain only digits' });

/**
 * Phone verification form schema
 * 
 * Complete schema for phone number + OTP verification forms.
 * 
 * @example
 * const { register, handleSubmit, formState: { errors } } = useForm({
 *   resolver: zodResolver(phoneVerificationSchema)
 * });
 */
export const phoneVerificationSchema = z.object({
  phoneNumber: phoneNumberSchema,
  otpCode: otpCodeSchema
});

/**
 * Type inference for phone verification form
 */
export type PhoneVerificationFormData = z.infer<typeof phoneVerificationSchema>;

/**
 * Profile update with phone schema
 * 
 * Schema for updating user profile with phone number.
 * 
 * @example
 * const profileSchema = z.object({
 *   firstName: z.string().min(1),
 *   lastName: z.string().min(1),
 *   phoneNumber: phoneNumberSchema
 * });
 */
export const profileWithPhoneSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  phoneNumber: phoneNumberSchema
});

/**
 * Type inference for profile with phone form
 */
export type ProfileWithPhoneFormData = z.infer<typeof profileWithPhoneSchema>;

export default phoneNumberSchema;

import { request } from "./api";

export interface ContactRequest {
  name: string;
  email: string;
  company?: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

export async function sendContactMessage(
  data: ContactRequest
): Promise<ContactResponse> {
  return request<ContactResponse>("/contact", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuth: true, // contact form لا يحتاج تسجيل دخول
  });
}
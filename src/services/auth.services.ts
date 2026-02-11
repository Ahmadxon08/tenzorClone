import type {
  LoginData,
  LoginResponse,
  RegisterData,
  RegisterOwnerData,
  ResetData,
  VerifyResponse,
} from "../types";
import type { ApiUser, ValidationResponse } from "./api";

const API_BASE_URL = "https://api.jobx.uz";

class authApiService {
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      accept: "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }
  async login(phoneNumber: string, password: string): Promise<LoginData> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ phoneNumber, password }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");

      throw new Error(`Login failed: ${response.status} ${text}`);
    }

    console.log("data", response.formData);

    return response.json();
  }
  async register(data: RegisterData): Promise<RegisterData> {
    const response = await fetch(`${API_BASE_URL}/memberregister`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,

        password: data.password,
        confirmPassword: data.confirmPassword,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Registration failed: ${response.status} ${text}`);
    }

    return response.json();
  }
  async registerOwner(data: RegisterOwnerData): Promise<RegisterOwnerData> {
    const response = await fetch(`${API_BASE_URL}/ownerregister`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        password: data.password,
        confirmPassword: data.confirmPassword,

        companyName: data.companyName,
        companyLogo: data.companyLogo,
        siteDomain: data.siteDomain,
        description: data.description,
        tokenDuration: data.tokenDuration,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Owner registration failed: ${response.status} ${text}`);
    }

    return response.json();
  }

  async resetPasswordRequest(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/reset_password/request`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        email: email,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Resetting password failed: ${response.status} ${text}`);
    }

    return response.json();
  }

  async forgetPasswordRequest(
    phoneNumber: string,
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/reset_password/request?phoneNumber=${encodeURIComponent(
        phoneNumber,
      )}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(text || "Reset password failed");
    }

    return response.json();
  }

  async resetPasswordVerify({
    email,
    code,
  }: {
    email: string;
    code: string;
  }): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/reset_password/verify_code`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        email: email,
        code: code,
      }),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Resetting password failed: ${response.status} ${text}`);
    }

    return response.json();
  }

  async sendVerification(
    email: string,
  ): Promise<{ status?: number; detail?: string; [k: string]: any }> {
    const response = await fetch(`${API_BASE_URL}/verification/send`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Send verification failed: ${response.status} ${text}`);
    }

    return response.json();
  }

  async verifyCode(phoneNumber: string, code: string): Promise<VerifyResponse> {
    const response = await fetch(`${API_BASE_URL}/verification/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ phoneNumber, code }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "Verification failed");
    }

    return result;
  }

  // forget password logic
  async verifyForgetPasswordCode(
    phoneNumber: string,
    code: string,
  ): Promise<VerifyResponse> {
    const response = await fetch(`${API_BASE_URL}/reset_password/verify_code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ phoneNumber, code }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "Verification failed");
    }

    return result;
  }
  async resetPasswordConfirm(
    data: ResetData,
  ): Promise<{ message: string; success: string }> {
    const response = await fetch(`${API_BASE_URL}/reset_password/verify_code`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        phoneNumber: data.phoneNumber,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Resetting password failed: ${response.status} ${text}`);
    }

    return response.json();
  }

  // aaaa

  async resendVerification(
    phoneNumber: string,
  ): Promise<{ success?: boolean; message?: string; [k: string]: any }> {
    const response = await fetch(
      `${API_BASE_URL}/verification/resend?phoneNumber=${phoneNumber}`,
      {
        method: "POST",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Resend verification failed");
    }

    return data;
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: "POST",

      headers: this.getAuthHeaders(refreshToken),

      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Refresh failed", response.status, text);
      throw new Error(`Token refresh failed: ${response.status} ${text}`);
    }

    return response.json();
  }

  // User Profile & Settings

  async validatePassword(
    token: string,
    password: string,
  ): Promise<ValidationResponse> {
    const response = await fetch(`${API_BASE_URL}/user_validation`, {
      method: "POST",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Password validation failed: ${response.status} ${text}`);
    }

    return response.json();
  }
  async updateCompanyInfo(
    data: {
      message_template?: string;
      company_name?: string;
      company_phone?: string;
      location?: number[];
      description?: string;
    },
    token: string,
  ): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/update_company_info`, {
      method: "PATCH",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Failed to update company info: ${response.status} ${text}`,
      );
    }

    return response.json();
  }
  async getCompanyInfo(token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/company_info`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) throw new Error("Failed to fetch company info");
    return response.json();
  }

  async updateProfile(
    token: string,
    data: {
      phoneNumber?: string;
      password?: string;
      sites?: Array<{
        siteId: number | string;
        siteName: string;
        domain_id: number | string;
        domainName: string;
      }>;
    },
  ): Promise<ApiUser> {
    const response = await fetch(`${API_BASE_URL}/update_me`, {
      method: "PUT",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to update profile: ${response.status} ${text}`);
    }

    return response.json();
  }
}
export const authService = new authApiService();

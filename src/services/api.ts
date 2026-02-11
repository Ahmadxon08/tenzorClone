// services/api.ts
import { any } from "zod";
import type {
  GetApplicationsCountBySiteResponse,
  WidgetData,
  CandidateProfile,
  CandidateComment,
} from "../types/index";
export const API_BASE_URL = "https://api.jobx.uz";

export interface ValidationResponse {
  detail: {
    valid: boolean;
  };
}

export interface ApiUser {
  id: number | string | null;
  name?: string;
  email?: string;
  fullName: string;
  phoneNumber: string;
  duration: string;
  activeSeance: string;
  type?: string;
  description?: string;
  sites?: {
    site_id?: number | string | null;
    site_name: string;
    site_domain: string;
    public_key: string;
    domain_id?: number | string | null;
    is_new?: boolean;
  }[];
  role?: string;
  companyName: string;
  companyPhone: string;
  companyLogo: string;
  location: string;
  messageTemplate: string;
}

export interface ChatMessage {
  id: number;
  sender: string;
  message: string;
  timestamp: string;
}

export interface SendSMSRequest {
  vakand_id: number | undefined;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  message_template: string;
}

export interface SendSMSResponse {
  success: boolean;
  message?: string;
  status_code: number;
  status: string;
}

class ApiService {
  private sitePublicKey?: string | null = null;
  private siteDomain?: string | null = null;

  setSite(public_key?: string | null, site_domain?: string | null) {
    this.sitePublicKey = public_key ?? null;
    this.siteDomain = site_domain ?? null;
  }

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

  private getQueryParams(
    public_key?: string | null,
    site_domain?: string | null,
  ): string {
    const pk = public_key ?? this.sitePublicKey ?? undefined;
    const sd = site_domain ?? this.siteDomain ?? undefined;

    const params = new URLSearchParams();

    if (typeof pk === "string" && pk.trim()) {
      params.set("public_key", pk.trim());
    }

    if (typeof sd === "string" && sd.trim()) {
      params.set("site_domain", sd.trim());
    }

    const query = params.toString();
    return query ? `?${query}` : "";
  }

  // get info by token
  async me(token: string): Promise<ApiUser> {
    const url = `${API_BASE_URL}/me${this.getQueryParams()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Unauthorized or failed to fetch user");
    }

    const json = await response.json();

    console.log("malumotlari buuu", json.data);

    if (json.data) return json.data as ApiUser;
    return json as ApiUser;
  }

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

  // Site management

  // ==================== VACANCY MANAGEMENT ====================

  // Video Assessment Upload URL
  async getVideoUploadUrl(
    sessionId: string,
    data: {
      filename: string;
      content_type: string;
      size_bytes: number;
      duration_seconds: number;
    },
  ): Promise<{
    status: number;
    upload_url: string;
    object_name: string;
    expires_at: string;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/video_app/session/${sessionId}/video/upload-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to get upload URL: ${response.status} ${text}`);
    }

    return response.json();
  }

  async getApplications(
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<any[]> {
    const query = this.getQueryParams(public_key, site_domain);
    const response = await fetch(
      `${API_BASE_URL}/filter_vakand_by_site${query}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(token),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Failed to fetch applications: ${response.status} ${text}`,
      );
    }

    return response.json();
  }

  async getApplicationsCountBySite(
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<GetApplicationsCountBySiteResponse> {
    const query = this.getQueryParams(public_key, site_domain);
    const response = await fetch(
      `${API_BASE_URL}/new_vakand_count_by_site${query}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(token),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Failed to fetch applications: ${response.status} ${text}`,
      );
    }

    const data: GetApplicationsCountBySiteResponse = await response.json();
    return data;
  }

  // Create temporary vacancy (for AI generation tab)
  async createTemporaryVacancy(
    payload: {
      title: string;
      salary: string;
      work_experiance: string;
      work_schedule: string;
      required: string;
      required_question: string;
      description?: string;
      widget_question?: string;
    },
    token?: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<{ status?: number; detail?: string; [key: string]: any }> {
    try {
      // Construct query parameters for site access
      const query = this.getQueryParams(public_key, site_domain);

      // Make API request
      const response = await fetch(
        `${API_BASE_URL}/create_vakansiya_vaqtincha${query}`,
        {
          method: "POST",
          headers: {
            ...this.getAuthHeaders(token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      // Handle non-successful responses
      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `Failed to create temporary vacancy: ${response.status} ${errorText}`,
        );
      }

      // Return parsed JSON response
      return response.json();
    } catch (error) {
      console.error("❌ Error creating temporary vacancy:", error);
      throw error;
    }
  }

  async getRequests(token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/support_chats/`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) throw new Error("Failed to fetch request infor");
    return response.json();
  }
  async UpdateLogo(token: string, icon: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", icon);

    const response = await fetch(`${API_BASE_URL}/company/logo`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`, // DO NOT set Content-Type
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      console.error("Upload error:", err);
      throw new Error(err?.detail || "Failed to upload logo");
    }

    return response.json();
  }

  async DeleteLogo(token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/company/logo`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      console.error("Delete error:", err);
      throw new Error(err?.detail || "Failed to delete logo");
    }

    return response.json();
  }

  async UpdateWidgetLogo(icon: File, id: number, token: string): Promise<any> {
    const formData = new FormData();
    formData.append("file", icon);
    const response = await fetch(`${API_BASE_URL}/site/${id}/logo`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      console.error("Upload error:", err);
      throw new Error(err?.detail || "Failed to upload logo");
    }

    return response.json();
  }

  async CreateWidgetInfo(
    data: WidgetData,
    id: number,
    token: string,
  ): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/site/${id}/widgets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      console.error("Upload error:", err);
      throw new Error(err?.detail || "Failed to upload logo");
    }

    return response.json();
  }

  async UpdateWidgetInfo(data: WidgetData, id: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/site/${id}/widgets`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      console.error("Upload error:", err);
      throw new Error(err?.detail || "Failed to upload logo");
    }

    return response.json();
  }

  async getTestInvite(token: string) {
    const response = await fetch(`${API_BASE_URL}/test-invite/${token}`, {
      method: "GET",
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      console.error("Upload error:", err);
      throw new Error(err?.detail || "Failed to upload logo");
    }

    return response.json();
  }

  async getTestInviteVideo(token: string) {
    const response = await fetch(`${API_BASE_URL}/video_app/invite/${token}`, {
      method: "GET",
    });

    if (!response.ok) {
      if (response.status === 410) {
        return { status: 410, detail: "Session expired" };
      }
      const err = await response.json().catch(() => any);
      console.error("Upload error:", err);
      if (err?.detail?.message == "Suhbat hali boshlanmagan") {
        return err;
      } else {
        throw new Error(err?.detail || "Failed to fetch invite");
      }
    }

    return response.json();
  }

  async createSession(payload: {
    name: string;
    phone: string;
    email: string;
    address: string;
    session_id: string;
    resume: File | null;
  }) {
    const formData = new FormData();

    formData.append("name", payload.name);
    formData.append("phone", payload.phone);
    formData.append("email", payload.email);
    formData.append("address", payload.address);
    formData.append("session_id", payload.session_id);
    if (payload.resume) {
      formData.append("resume", payload.resume);
    }

    const res = await fetch(`${API_BASE_URL}/video_app/session`, {
      method: "POST",
      body: formData,
    });

    return res.json();
  }

  async joinSession(payload: {
    session_id: string;
    candidate_name: string;
    language: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/video_app/session/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  }
  async sendVoice(sessionId: string, audioBlob: Blob, language: string = "uz") {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    formData.append("session_id", sessionId);
    formData.append("language", language);

    const res = await fetch(
      `${API_BASE_URL}/video_app/session/${sessionId}/voice`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.statusText}`);
    }

    return res.json();
  }

  async uploadVideo(
    sessionId: string,
    videoBlob: Blob,
    durationSeconds?: number,
  ) {
    const formData = new FormData();
    formData.append("video", videoBlob, "session_video.webm");
    formData.append("session_id", sessionId);
    if (typeof durationSeconds === "number") {
      formData.append("duration_seconds", String(durationSeconds));
    }

    const res = await fetch(
      `${API_BASE_URL}/video_app/session/${sessionId}/video/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to upload video: ${res.status} ${text}`);
    }

    return res.json();
  }

  async completeSession(session_id: string) {
    const res = await fetch(
      `${API_BASE_URL}/video_app/session/${session_id}/complete`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!res.ok) {
      throw new Error(`Upload failed: ${res.statusText}`);
    }
    return res.json();
  }

  async checkCheating(sessionId: string, cheat_name: string, reason: string) {
    const body = {
      cheat_name: cheat_name,
      payload: {
        reason: reason,
      },
    };

    const res = await fetch(
      `${API_BASE_URL}/video_app/session/${sessionId}/cheating`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Upload failed: ${res.statusText}`);
    }

    return res.json();
  }

  async getVideoSession(sessionId: string) {
    const res = await fetch(`${API_BASE_URL}/video_app/session/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      // If 404 or other error, we assume session data is not present or invalid
      // We can throw or return null. Returning null might be easier for the UI to handle "not found".
      // However, existing patterns throw. Let's throw and catch in UI.
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to get session: ${res.statusText}`,
      );
    }
    return res.json();
  }

  async CreateTestLink(
    vakansiya_id: number,
    public_key: string,
    site_domain: string,
    starts_at: string,
  ) {
    const data = {
      vakansiya_id,
      public_key,
      site_domain,
      starts_at,
    };
    const response = await fetch(`${API_BASE_URL}/test-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      console.error("Upload error:", err);
      throw new Error(err?.detail || "Failed to upload logo");
    }

    return response.json();
  }

  async CreateTestLinkVideo(
    vakansiya_id: number,
    public_key: string,
    starts_at: string,
  ) {
    const data = {
      vakansiya_id,
      public_key,
      starts_at,
    };
    const response = await fetch(`${API_BASE_URL}/video_app/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      console.error("Upload error:", err);
      throw new Error(err?.detail || "Failed to upload logo");
    }

    return response.json();
  }

  async getRecommendation(
    vakansiya_id: number,
    public_key: string,
    site_domain: string,
    token: string,
  ) {
    const url = new URL(`${API_BASE_URL}/vakansiya/recommendation`);
    url.searchParams.append("vakansiya_id", String(vakansiya_id));
    url.searchParams.append("public_key", public_key);
    url.searchParams.append("site_domain", site_domain);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
          `Recommendation fetch failed: ${response.statusText}`,
      );
    }

    return response.json();
  }

  async getCandidateProfile(
    candidateId: string | number,
    token: string,
  ): Promise<CandidateProfile> {
    const url = new URL(`${API_BASE_URL}/api/v1/candidates/${candidateId}`);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to fetch candidate: ${response.statusText}`,
      );
    }

    return response.json();
  }

  async getCandidateComments(
    candidateId: string | number,
    token: string,
  ): Promise<CandidateComment[]> {
    const url = new URL(
      `${API_BASE_URL}/api/v1/candidates/${candidateId}/comments`,
    );

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to fetch comments: ${response.statusText}`,
      );
    }

    return response.json();
  }

  async addCommentToCandidate(
    candidateId: string | number,
    content: string,
    token: string,
  ): Promise<CandidateComment> {
    const url = new URL(
      `${API_BASE_URL}/api/v1/candidates/${candidateId}/comments`,
    );

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to add comment: ${response.statusText}`,
      );
    }

    return response.json();
  }

  // ==================== AUTH METHODS ====================
  async login(phoneNumber: string, password: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ phoneNumber, password }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Login failed: ${response.status} ${text}`);
    }

    return response.json();
  }

  async register(data: any): Promise<any> {
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

  async registerOwner(data: any): Promise<any> {
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
      body: JSON.stringify({ email: email }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Resetting password failed: ${response.status} ${text}`);
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
      body: JSON.stringify({ email: email, code: code }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Resetting password failed: ${response.status} ${text}`);
    }

    return response.json();
  }

  async resetPasswordConfirm(data: any): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/reset_password/set_password`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          confirm_password: data.confirm_password,
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Resetting password failed: ${response.status} ${text}`);
    }

    return response.json();
  }

  async sendVerification(email: string): Promise<any> {
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

  async verifyCode(phoneNumber: string, code: string): Promise<any> {
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

  async resendVerification(phoneNumber: string): Promise<any> {
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

  async refreshToken(refreshToken: string): Promise<any> {
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

  async updateCompanyInfo(data: any, token: string): Promise<any> {
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

    if (!response.ok) {
      throw new Error("Failed to fetch company info");
    }

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

  // ==================== SITE METHODS ====================
  async addSite(
    name: string,
    domain: string,
    token: string,
  ): Promise<{ public_key: string }> {
    const response = await fetch(`${API_BASE_URL}/add_site`, {
      method: "POST",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ name, domain }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to add site: ${response.status} ${text}`);
    }

    return response.json();
  }

  async getSites(token: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/show_sites`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to fetch sites: ${response.status} ${text}`);
    }

    return response.json();
  }

  async getSite(
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<any> {
    const query = this.getQueryParams(public_key, site_domain);
    const response = await fetch(`${API_BASE_URL}/site/info${query}`, {
      method: "GET",
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to fetch site: ${response.status} ${text}`);
    }

    return response.json();
  }

  async deleteSite(
    siteId: number,
    token: string,
  ): Promise<{ status: number; detail: string }> {
    const response = await fetch(`${API_BASE_URL}/delete_site/${siteId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to delete site: ${response.status} ${text}`);
    }

    return response.json();
  }

  async updateSiteName(
    siteId: number | string,
    name: string,
    token: string,
  ): Promise<{ status: number; detail: string }> {
    const response = await fetch(`${API_BASE_URL}/update_site/${siteId}`, {
      method: "PATCH",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ site_name: name }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to update site name: ${response.status} ${text}`);
    }

    return response.json();
  }

  async updateSiteDomain(
    domainId: number | string,
    domain: string,
    token: string,
  ): Promise<{ status: number; detail: string }> {
    const response = await fetch(`${API_BASE_URL}/update_domain/${domainId}`, {
      method: "PATCH",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ domain }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Failed to update site domain: ${response.status} ${text}`,
      );
    }

    return response.json();
  }

  // ==================== VACANCY METHODS ====================
  async getVacancies(
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<any[]> {
    const query = this.getQueryParams(public_key, site_domain);
    const response = await fetch(`${API_BASE_URL}/show_vakansiya${query}`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to fetch vacancies: ${response.status} ${text}`);
    }

    return response.json();
  }

  async getAllVacancies(
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<any[]> {
    const query = this.getQueryParams(public_key, site_domain);

    const response = await fetch(`${API_BASE_URL}/filter_vakansiya${query}`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to fetch vacancies: ${response.status} ${text}`);
    }

    const json = await response.json();

    if (!json?.data || !Array.isArray(json.data)) {
      console.error("Invalid vacancies response:", json);
      return [];
    }

    return json.data;
  }

  async generateVacancyDescription(data: any): Promise<{ answer: string }> {
    const response = await fetch(
      `${API_BASE_URL}/create_vakansiya_description`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Failed to generate description: ${response.status} ${text}`,
      );
    }

    return response.json();
  }

  async createVacancy(
    vacancy: any,
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<any> {
    const query = this.getQueryParams(public_key, site_domain);
    const response = await fetch(`${API_BASE_URL}/create_vakansiya${query}`, {
      method: "POST",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(vacancy),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to create vacancy: ${response.status} ${text}`);
    }

    return response.json();
  }

  async updateVacancy(
    id: number,
    vacancy: any,
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<any> {
    const query = this.getQueryParams(public_key, site_domain);
    const response = await fetch(
      `${API_BASE_URL}/update_vakansiya/${id}${query}`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(vacancy),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to update vacancy: ${response.status} ${text}`);
    }

    return response.json();
  }

  async reOrderVacancy(
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
    ids?: number[],
  ): Promise<any> {
    const query = this.getQueryParams(public_key, site_domain);
    const response = await fetch(`${API_BASE_URL}/reorder_vakansiya${query}`, {
      method: "POST",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to reorder vacancy: ${response.status} ${text}`);
    }

    return response.json();
  }

  async deleteVacancy(
    id: number,
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<any> {
    const query = this.getQueryParams(public_key, site_domain);
    const response = await fetch(
      `${API_BASE_URL}/delete_vakansiya/${id}${query}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(token),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to delete vacancy: ${response.status} ${text}`);
    }

    return response.json();
  }

  async markVacandAsShowed(
    id: number,
    token?: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<{ status: number; detail?: string }> {
    const queryParams = new URLSearchParams();

    if (public_key) queryParams.append("public_key", public_key);
    if (site_domain) queryParams.append("site_domain", site_domain);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    const response = await fetch(
      `${API_BASE_URL}/showed_vakand/${id}${queryString}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(token),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Failed to mark showed vakand: ${response.status} ${text}`,
      );
    }

    return response.json();
  }

  async markVacandVideoAsShowed(
    id: number,
    token?: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<{ status: number; detail?: string }> {
    const queryParams = new URLSearchParams();

    if (public_key) queryParams.append("public_key", public_key);
    if (site_domain) queryParams.append("site_domain", site_domain);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    const response = await fetch(
      `${API_BASE_URL}/video_app/showed_vakand/${id}${queryString}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(token),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Failed to mark showed vakand: ${response.status} ${text}`,
      );
    }

    return response.json();
  }

  async getDomainStats(token: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/stats/domain`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Failed to fetch domain stats: ${response.status} ${text}`,
      );
    }

    return response.json();
  }

  async getVacancyCounts(
    token: string,
    granularity: "day" | "week" | "month" | "year",
    periodCount: number,
  ): Promise<any[]> {
    const url = `${API_BASE_URL}/count_vakand?date=${encodeURIComponent(
      granularity,
    )}&period_count=${encodeURIComponent(String(periodCount))}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Failed to fetch vacancy counts: ${response.status} ${text}`,
      );
    }

    return response.json();
  }

  async filterVakandByDate(
    token: string,
    public_key: string,
    from_date?: string,
    to_date?: string,
    site_domain?: string | null,
  ): Promise<any[]> {
    const params = new URLSearchParams();

    params.set("public_key", public_key);

    if (from_date) params.set("from_date", from_date);
    if (to_date) params.set("to_date", to_date);
    if (site_domain) params.set("site_domain", site_domain);

    const query = `?${params.toString()}`;

    const response = await fetch(`${API_BASE_URL}/filter_vakand${query}`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Failed to filter vakand by date: ${response.status} ${text}`,
      );
    }

    return response.json();
  }

  async getApplicationsExcel(
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
    vakansiya_id?: string | null,
    success_rate?: number | null,
    type?: string | null,
    search?: string | null,
    from_date?: string | null,
    to_date?: string | null,
    has_invited?: string | null,
  ): Promise<{ success: boolean }> {
    const params: Record<string, string> = {};

    const isValid = (val: any) =>
      val !== null && val !== undefined && val !== "" && val !== "null";

    if (isValid(public_key)) params.public_key = public_key!;
    if (isValid(site_domain)) params.site_domain = site_domain!;
    if (isValid(vakansiya_id)) params.vakansiya_id = vakansiya_id!;
    if (isValid(search)) params.search = search!;
    if (isValid(from_date)) params.from_date = from_date!;
    if (isValid(to_date)) params.to_date = to_date!;
    if (isValid(has_invited)) params.has_invited = has_invited!;
    if (isValid(success_rate)) params.success_rate = String(success_rate);
    if (isValid(type)) params.type = type!;

    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/vakand/list/excel${query ? `?${query}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Failed to fetch applications: ${response.status} ${text}`,
      );
    }

    const blob = await response.blob();
    const urlBlob = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", "applications.xlsx");
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(urlBlob);

    return { success: true };
  }

  // ==================== TEST METHODS ====================
  async getTests(
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<any> {
    const query = this.getQueryParams(public_key, site_domain);
    const response = await fetch(`${API_BASE_URL}/show_tests${query}`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to fetch tests: ${response.status} ${text}`);
    }
    return response.json();
  }

  async createQuestion(
    payload: any,
    token?: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<any> {
    const query = this.getQueryParams(public_key, site_domain);
    const response = await fetch(`${API_BASE_URL}/create_question${query}`, {
      method: "POST",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to create question: ${response.status} ${text}`);
    }

    return response.json();
  }

  async chatTest(
    body: any,
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<any> {
    const query = this.getQueryParams(public_key, site_domain);
    const response = await fetch(`${API_BASE_URL}/chat_test${query}`, {
      method: "POST",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to chat_test: ${response.status} ${text}`);
    }
    return response.json();
  }

  async updateTest(
    id: number,
    payload: any,
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<any> {
    const query = this.getQueryParams(public_key, site_domain);
    const response = await fetch(`${API_BASE_URL}/update_test/${id}${query}`, {
      method: "PUT",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to update test: ${response.status} ${text}`);
    }
    return response.json();
  }

  async deleteTest(
    id: number,
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<any> {
    const query = this.getQueryParams(public_key, site_domain);
    const response = await fetch(`${API_BASE_URL}/delete_test/${id}${query}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(token),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to delete test: ${response.status} ${text}`);
    }
    return response.json();
  }

  async createTest(
    payload: any,
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<any> {
    const query = this.getQueryParams(public_key, site_domain);
    const response = await fetch(`${API_BASE_URL}/create_test${query}`, {
      method: "POST",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to create test: ${response.status} ${text}`);
    }
    return response.json();
  }

  // ==================== SMS & CHAT METHODS ====================
  async sendSMS(
    body: SendSMSRequest,
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<SendSMSResponse> {
    const params = new URLSearchParams();
    if (public_key) params.append("public_key", public_key);
    if (site_domain) params.append("site_domain", site_domain);

    const query = params.toString() ? `?${params.toString()}` : "";

    const response = await fetch(`${API_BASE_URL}/sms/send${query}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to send SMS: ${response.status} ${text}`);
    }

    return response.json();
  }

  async getChat(sessionId: string | number, token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/show_chat/${sessionId}`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to get chat: ${response.status} ${text}`);
    }

    return response.json();
  }

  async getVideoChat(sessionId: string | number, token: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/video_app/session/${sessionId}/transcript`,
      {
        method: "GET",
        headers: this.getAuthHeaders(token),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to get video chat: ${response.status} ${text}`);
    }

    return response.json();
  }

  // ==================== USER METHODS ====================
  async getAllUsers(token: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/get_user`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return response.json();
  }

  async deleteUser(userId: number, token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/delete_user/${userId}`, {
      method: "POST",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    return response.json();
  }

  async toggleBan(userId: number, token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/user_ban/${userId}`, {
      method: "POST",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Failed to toggle ban");
    }

    return response.json();
  }
}

export const apiService = new ApiService();

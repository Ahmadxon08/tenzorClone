import type {
  ChatTestRequest,
  ChatTestResponse,
  CreateOrUpdateTestDto,
  TestItem,
} from "../types";
import { API_BASE_URL, type SendSMSRequest, type SendSMSResponse } from "./api";

class TestService {
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

  async createTest(
    payload: CreateOrUpdateTestDto,
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<{ status: number; detail: string }> {
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

  // Question yaratish
  async createQuestion(
    payload: { required_question?: string; [k: string]: any },
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

  // Testlar ro'yxati
  async getTests(
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<{ status: number; data: TestItem[] }> {
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

  // Test yangilash
  async updateTest(
    id: number,
    payload: CreateOrUpdateTestDto,
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<{ status: number; detail: string }> {
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

  // Test o'chirish
  async deleteTest(
    id: number,
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<{ status: number; detail: string }> {
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

  // Chat test (AI suhbat)
  async chatTest(
    body: ChatTestRequest,
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<ChatTestResponse> {
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
  async getChat(
    sessionId: string | number,
    token: string,
  ): Promise<{
    session_id: string;
    chat: Array<{ Human?: string; AI?: string }>;
  }> {
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

  async getVideoChat(
    sessionId: string | number,
    token: string,
  ): Promise<{
    session_id: string;
    data: Array<{ Human?: string; AI?: string }>;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/video_app/session/${sessionId}/transcript`,
      {
        method: "GET",
        headers: this.getAuthHeaders(token),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to get chat: ${response.status} ${text}`);
    }

    return response.json();
  }

  async sendSMS(
    body: SendSMSRequest,
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<SendSMSResponse> {
    const query =
      public_key || site_domain
        ? `?${new URLSearchParams({
            public_key: public_key || "",
            site_domain: site_domain || "",
          }).toString()}`
        : "";

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
}

export const testService = new TestService();

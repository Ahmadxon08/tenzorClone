import type {
  ApiResponse,
  GetApplicationsCountBySiteResponse,
  Vacancy,
} from "../types";
import { API_BASE_URL } from "./api";

class VacancyService {
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
  async getVacancies(
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<Vacancy[]> {
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
  ): Promise<Vacancy[]> {
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
  ) {
    const params: Record<string, string> = {};

    // Helper to check if a value is actually usable
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
    // 1. Get the response as a Blob instead of JSON
    const blob = await response.blob();

    // 2. Create a temporary URL for the binary data
    const urlBlob = window.URL.createObjectURL(blob);

    // 3. Create a hidden 'a' tag to trigger the download
    const link = document.createElement("a");
    link.href = urlBlob;

    // Set the filename (you can customize this)
    link.setAttribute("download", "applications.xlsx");

    // 4. Append to body, click it, and cleanup
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(urlBlob);

    return { success: true };
  }

  async generateVacancyDescription(data: {
    work_experiance?: string;
    work_schedule?: string;
    position_name?: string;
    salary?: string;
    position_role?: string;
    required?: string;
  }): Promise<{ answer: string }> {
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

  // ✅ Create vacancy with specific site
  async createVacancy(
    vacancy: Omit<Vacancy, "id">,
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<ApiResponse<any>> {
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

  // ✅ Update vacancy with specific site
  async updateVacancy(
    id: number,
    vacancy: Partial<Vacancy>,
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<ApiResponse<any>> {
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
  ) {
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

  // ✅ Delete vacancy with specific site
  async deleteVacancy(
    id: number,
    token: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<ApiResponse<any>> {
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
    //  URL parametrlari faqat mavjud bo‘lsa qo‘shiladi
    const queryParams = new URLSearchParams();

    if (public_key) queryParams.append("public_key", public_key);
    if (site_domain) queryParams.append("site_domain", site_domain);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    console.log(id);

    // Fetch chaqirig‘i
    const response = await fetch(
      `${API_BASE_URL}/showed_vakand/${id}${queryString}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(token),
      },
    );

    //  Xatolikni to‘g‘ri qaytarish
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Failed to mark showed vakand: ${response.status} ${text}`,
      );
    }

    //  Javobni JSON ko‘rinishida qaytarish
    return response.json();
  }
  async markVacandVideoAsShowed(
    id: number,
    token?: string,
    public_key?: string | null,
    site_domain?: string | null,
  ): Promise<{ status: number; detail?: string }> {
    //  URL parametrlari faqat mavjud bo‘lsa qo‘shiladi
    const queryParams = new URLSearchParams();

    if (public_key) queryParams.append("public_key", public_key);
    if (site_domain) queryParams.append("site_domain", site_domain);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    console.log(id);

    // Fetch chaqirig‘i
    const response = await fetch(
      `${API_BASE_URL}/video_app/showed_vakand/${id}${queryString}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(token),
      },
    );

    //  Xatolikni to‘g‘ri qaytarish
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Failed to mark showed vakand: ${response.status} ${text}`,
      );
    }

    //  Javobni JSON ko‘rinishida qaytarish
    return response.json();
  }

  // 1) Domain bo‘yicha so‘rovlar statistikasi
  async getDomainStats(
    token: string,
  ): Promise<
    Array<{ domain_id: number; domain: string; total_requests: number }>
  > {
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
  ): Promise<
    Array<{ date: string; total: number; success: number; failed: number }>
  > {
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

  // ==================== FILTER VAKAND ====================
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
}

export const vacancyService = new VacancyService();

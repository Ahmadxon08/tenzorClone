import type { Site } from "../types";
import { API_BASE_URL } from "./api";

class siteServiceApi {
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

  async getSites(token: string): Promise<Site[]> {
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
  ): Promise<Site> {
    const query = this.getQueryParams(public_key, site_domain);
    const response = await fetch(`${API_BASE_URL}/site/info${query}`, {
      method: "GET",
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to fetch vacancies: ${response.status} ${text}`);
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

  // ✅ Update site name
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

  // Update site domain
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
}

export const apiSiteService = new siteServiceApi();

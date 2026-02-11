import { API_BASE_URL } from "./api";

class UserService {
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

  async getAllUsers(token: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/get_user`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  }

  // ✅ Delete user
  async deleteUser(userId: number, token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/delete_user/${userId}`, {
      method: "POST",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) throw new Error("Failed to delete user");
    return response.json();
  }

  // ✅ Ban user (toggle ban)
  async toggleBan(userId: number, token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/user_ban/${userId}`, {
      method: "POST",
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) throw new Error("Failed to toggle ban");
    return response.json();
  }
}

export const userService = new UserService();

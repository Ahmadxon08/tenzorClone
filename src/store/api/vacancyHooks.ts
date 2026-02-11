import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { Vacancy, VacancyFormData } from "../../types";

const API_BASE_URL = "https://ai.tenzorsoft.uz";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Query keys
export const vacancyKeys = {
  all: ["vacancies"] as const,
  lists: () => [...vacancyKeys.all, "list"] as const,
  list: (filters?: { publicKey?: string; siteDomain?: string }) =>
    [...vacancyKeys.lists(), { ...filters }] as const,
  details: () => [...vacancyKeys.all, "detail"] as const,
  detail: (id: number) => [...vacancyKeys.details(), id] as const,
};

// Queries
export const useGetAllVacanciesQuery = (
  params?: { publicKey?: string; siteDomain?: string },
  options?: { enabled?: boolean },
) => {
  return useQuery<Vacancy[]>({
    queryKey: vacancyKeys.list(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.publicKey) queryParams.set("public_key", params.publicKey);
      if (params?.siteDomain) queryParams.set("site_domain", params.siteDomain);
      const query = queryParams.toString();

      const response = await axiosInstance.get<Vacancy[]>(
        `/show_vakansiya?${query}`,
      );
      return response.data || [];
    },
    enabled: options?.enabled ?? true,
  });
};

// Mutations
export const useCreateVacancyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      data: VacancyFormData;
      publicKey?: string;
      siteDomain?: string;
    }) => {
      const { data, publicKey, siteDomain } = payload;
      const queryParams = new URLSearchParams();
      if (publicKey) queryParams.set("public_key", publicKey);
      if (siteDomain) queryParams.set("site_domain", siteDomain);
      const query = queryParams.toString();

      return await axiosInstance.post(`/create_vakansiya?${query}`, data);
    },
    onSuccess: () => {
      // Invalidate all vacancy queries
      queryClient.invalidateQueries({ queryKey: vacancyKeys.lists() });
    },
  });
};

export const useUpdateVacancyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: number;
      data: Partial<VacancyFormData>;
      publicKey?: string;
      siteDomain?: string;
    }) => {
      const { id, data, publicKey, siteDomain } = payload;
      const queryParams = new URLSearchParams();
      if (publicKey) queryParams.set("public_key", publicKey);
      if (siteDomain) queryParams.set("site_domain", siteDomain);
      const query = queryParams.toString();

      return await axiosInstance.patch(
        `/update_vakansiya/${id}?${query}`,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: vacancyKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: vacancyKeys.lists() });
    },
  });
};

export const useDeleteVacancyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: number;
      publicKey?: string;
      siteDomain?: string;
    }) => {
      const { id, publicKey, siteDomain } = payload;
      const queryParams = new URLSearchParams();
      if (publicKey) queryParams.set("public_key", publicKey);
      if (siteDomain) queryParams.set("site_domain", siteDomain);
      const query = queryParams.toString();

      return await axiosInstance.delete(`/delete_vakansiya/${id}?${query}`);
    },
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: vacancyKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: vacancyKeys.lists() });
    },
  });
};

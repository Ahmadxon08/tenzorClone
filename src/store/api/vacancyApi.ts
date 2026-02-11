import { apiSlice } from "./apiSlice";
import type { Vacancy, VacancyFormData } from "../../types";

export const vacancyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllVacancies: builder.query<
      Vacancy[],
      { publicKey?: string; siteDomain?: string } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.publicKey) queryParams.set("public_key", params.publicKey);
        if (params?.siteDomain)
          queryParams.set("site_domain", params.siteDomain);
        const query = queryParams.toString();
        return `/show_vakansiya?${query}`;
      },
      transformResponse: (response: Vacancy[]) => response || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Vacancy" as const, id })),
              { type: "Vacancy", id: "LIST" },
            ]
          : [{ type: "Vacancy", id: "LIST" }],
    }),
    createVacancy: builder.mutation<
      void,
      { data: VacancyFormData; publicKey?: string; siteDomain?: string }
    >({
      query: ({ data, publicKey, siteDomain }) => {
        const queryParams = new URLSearchParams();
        if (publicKey) queryParams.set("public_key", publicKey);
        if (siteDomain) queryParams.set("site_domain", siteDomain);
        const query = queryParams.toString();
        return {
          url: `/create_vakansiya?${query}`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: [{ type: "Vacancy", id: "LIST" }],
    }),
    updateVacancy: builder.mutation<
      void,
      {
        id: number;
        data: Partial<VacancyFormData>;
        publicKey?: string;
        siteDomain?: string;
      }
    >({
      query: ({ id, data, publicKey, siteDomain }) => {
        const queryParams = new URLSearchParams();
        if (publicKey) queryParams.set("public_key", publicKey);
        if (siteDomain) queryParams.set("site_domain", siteDomain);
        const query = queryParams.toString();
        return {
          url: `/update_vakansiya/${id}?${query}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Vacancy", id },
        { type: "Vacancy", id: "LIST" },
      ],
    }),
    deleteVacancy: builder.mutation<
      void,
      { id: number; publicKey?: string; siteDomain?: string }
    >({
      query: ({ id, publicKey, siteDomain }) => {
        const queryParams = new URLSearchParams();
        if (publicKey) queryParams.set("public_key", publicKey);
        if (siteDomain) queryParams.set("site_domain", siteDomain);
        const query = queryParams.toString();
        return {
          url: `/delete_vakansiya/${id}?${query}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Vacancy", id },
        { type: "Vacancy", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllVacanciesQuery,
  useCreateVacancyMutation,
  useUpdateVacancyMutation,
  useDeleteVacancyMutation,
} = vacancyApi;

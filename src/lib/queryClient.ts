// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: Error) => {
        const errorWithStatus = error as Error & { status: number };
        // Don't retry on 401 errors (unauthorized)
        if (errorWithStatus?.status === 401) return false;
        // Don't retry on 403 errors (forbidden)
        if (errorWithStatus?.status === 403) return false;
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

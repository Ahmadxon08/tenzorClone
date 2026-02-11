// hooks/useVacancies.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Vacancy, VacancyFormData } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Query keys
const QUERY_KEYS = {
  vacancies: ['vacancies'] as const,
};

// Get vacancies hook
export const useVacancies = () => {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: QUERY_KEYS.vacancies,
    queryFn: () => {
      if (!token) throw new Error('No token available');
      return apiService.getVacancies(token);
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Create vacancy hook
export const useCreateVacancy = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (vacancy: VacancyFormData) => {
      if (!token) throw new Error('No token available');
      return apiService.createVacancy(vacancy, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vacancies });
    },
  });
};

// Update vacancy hook
export const useUpdateVacancy = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, vacancy }: { id: number; vacancy: Partial<Vacancy> }) => {
      if (!token) throw new Error('No token available');
      return apiService.updateVacancy(id, vacancy, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vacancies });
    },
  });
};

// Delete vacancy hook
export const useDeleteVacancy = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => {
      if (!token) throw new Error('No token available');
      return apiService.deleteVacancy(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vacancies });
    },
  });
};

// Combined hook for all vacancy operations
export const useVacancyOperations = () => {
  const vacanciesQuery = useVacancies();
  const createMutation = useCreateVacancy();
  const updateMutation = useUpdateVacancy();
  const deleteMutation = useDeleteVacancy();
  
  return {
    // Data
    vacancies: vacanciesQuery.data || [],
    isLoading: vacanciesQuery.isLoading,
    isError: vacanciesQuery.isError,
    error: vacanciesQuery.error,
    
    // Actions
    createVacancy: createMutation.mutateAsync,
    updateVacancy: updateMutation.mutateAsync,
    deleteVacancy: deleteMutation.mutateAsync,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Refetch
    refetch: vacanciesQuery.refetch,
  };
};
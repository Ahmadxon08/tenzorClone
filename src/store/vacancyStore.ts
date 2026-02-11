import { create } from "zustand";
import type { Vacancy } from "../types";

interface VacancyStore {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  editingVacancy: Vacancy | undefined;
  setEditingVacancy: (vacancy: Vacancy | undefined) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedSite: any | null;
  setSelectedSite: (site: any | null) => void;
}

export const useVacancyStore = create<VacancyStore>((set) => ({
  showForm: false,
  setShowForm: (show) => set({ showForm: show }),
  editingVacancy: undefined,
  setEditingVacancy: (vacancy) => set({ editingVacancy: vacancy }),
  searchTerm: "",
  setSearchTerm: (term) => set({ searchTerm: term }),
  selectedSite: null,
  setSelectedSite: (site) => set({ selectedSite: site }),
}));

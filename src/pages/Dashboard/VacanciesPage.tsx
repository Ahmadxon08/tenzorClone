import React, { useEffect } from "react";
import {
  useGetAllVacanciesQuery,
  useCreateVacancyMutation,
  useUpdateVacancyMutation,
  useDeleteVacancyMutation,
} from "../../store/api/vacancyHooks";
import { useVacancyStore } from "../../store/vacancyStore";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import type { Vacancy, VacancyFormData } from "../../types/index";

import StatsCards from "../../components/dashboard/StatsCards";
import VacanciesList from "../../components/dashboard/VacanciesList";
import VacancyFormModal from "../../components/dashboard/VacancyFormModal";
import { t } from "i18next";

const VacanciesPage: React.FC = () => {
  const { token, user } = useAuth();

  // Zustand store
  const showForm = useVacancyStore((state) => state.showForm);
  const setShowForm = useVacancyStore((state) => state.setShowForm);
  const editingVacancy = useVacancyStore((state) => state.editingVacancy);
  const setEditingVacancy = useVacancyStore((state) => state.setEditingVacancy);
  const searchTerm = useVacancyStore((state) => state.searchTerm);
  const setSearchTerm = useVacancyStore((state) => state.setSearchTerm);
  const selectedSite = useVacancyStore((state) => state.selectedSite);
  const setSelectedSite = useVacancyStore((state) => state.setSelectedSite);

  useEffect(() => {
    // initialize selectedSite if user changes (e.g. after login)
    if (user?.sites && user.sites.length > 0 && !selectedSite) {
      setSelectedSite(user.sites[0]);
      apiService.setSite(user.sites[0].public_key, user.sites[0].site_domain);
    }
  }, [user, selectedSite, setSelectedSite]);

  console.log("user in dashboard", user);

  // React Query hooks
  const {
    data: vacancies = [],
    isLoading: loading,
    refetch,
  } = useGetAllVacanciesQuery(
    {
      publicKey: selectedSite?.public_key,
      siteDomain: selectedSite?.site_domain,
    },
    { enabled: !!selectedSite && !!token },
  );

  const createVacancyMutation = useCreateVacancyMutation();
  const updateVacancyMutation = useUpdateVacancyMutation();
  const deleteVacancyMutation = useDeleteVacancyMutation();

  const actionLoading =
    createVacancyMutation.isPending ||
    updateVacancyMutation.isPending ||
    deleteVacancyMutation.isPending;

  const handleSiteSelect = (site: any | null) => {
    setSelectedSite(site);
    apiService.setSite(site?.public_key ?? null, site?.site_domain ?? null);
  };

  const handleSaveVacancy = async (
    vacancyData: VacancyFormData,
    site?: any,
  ) => {
    if (!token) return;

    const targetSite = site || selectedSite;
    if (!targetSite) return;

    try {
      if (editingVacancy) {
        await updateVacancyMutation.mutateAsync({
          id: editingVacancy.id,
          data: vacancyData,
          publicKey: targetSite?.public_key,
          siteDomain: targetSite?.site_domain,
        });
      } else {
        await createVacancyMutation.mutateAsync({
          data: vacancyData,
          publicKey: targetSite?.public_key,
          siteDomain: targetSite?.site_domain,
        });
      }

      // Refresh the list explicitly
      await refetch();

      setShowForm(false);
      setEditingVacancy(undefined);
    } catch (error) {
      console.error("Failed to save vacancy:", error);
    }
  };

  const handleDeleteVacancy = async (id: number) => {
    if (!token) return;

    try {
      await deleteVacancyMutation.mutateAsync({
        id,
        publicKey: selectedSite?.public_key,
        siteDomain: selectedSite?.site_domain,
      });
      await refetch();
    } catch (error) {
      console.error("Failed to delete vacancy:", error);
    }
  };

  const handleEditVacancy = (vacancy: Vacancy) => {
    console.log("editing vacancy", vacancy);
    setEditingVacancy(vacancy);
    setShowForm(true);
  };

  const handleCreateVacancy = () => {
    setEditingVacancy(undefined);
    setShowForm(true);
  };

  // const filteredApplications = vacancies.filter((vac) =>
  //   vac.title.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t("vacancyPage.header.title")}
        </h1>
        <p className="text-gray-400">{t("vacancyPage.header.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VacanciesList
            vacancies={vacancies}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onEdit={handleEditVacancy}
            onDelete={handleDeleteVacancy}
            onCreate={handleCreateVacancy}
            onRefresh={refetch}
            loading={loading}
            actionLoading={actionLoading}
            selectedSite={selectedSite}
            onSiteSelect={handleSiteSelect}
            onSave={handleSaveVacancy}
          />
        </div>
        <StatsCards
          vacanciesCount={vacancies.length}
          // applicationsCount={filteredApplications.length}
        />
      </div>

      <VacancyFormModal
        open={showForm}
        vacancy={editingVacancy}
        siteDomain={selectedSite?.site_domain}
        publicKey={selectedSite?.public_key}
        onSave={handleSaveVacancy}
        onClose={() => {
          setShowForm(false);
          setEditingVacancy(undefined);
        }}
        isLoading={actionLoading}
        initialSelectedSite={selectedSite}
      />
    </>
  );
};

export default VacanciesPage;

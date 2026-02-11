// components/dashboard/VacanciesList.tsx
import { Briefcase, Plus, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import type { Site, Vacancy, VacancyFormData } from "../../types/index";
import VacancyCard from "./VacancyCard";
import VacancyDeleteModal from "../../components/dashboard/VacancyDeleteModal";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

interface VacanciesListProps {
  vacancies: Vacancy[];
  searchTerm: string;
  onDelete: (id: number) => void;
  onRefresh: () => void;
  loading: boolean;
  actionLoading: boolean;
  onSearchChange: (value: string) => void;
  onSave: (data: VacancyFormData) => Promise<void>;
  selectedSite:
    | { name: string; public_key: string; site_domain: string }
    | null
    | undefined;

  onSiteSelect?: (site: any) => void;
  onCreate: () => void;
  onEdit?: (vacancy: Vacancy) => void;
}

const VacanciesList: React.FC<VacanciesListProps> = ({
  vacancies: propVacancies,
  searchTerm,
  onDelete,
  onRefresh,
  loading,
  actionLoading,
  onSearchChange,
  selectedSite,
  onSiteSelect,
  // onCreate,
  onEdit,
}) => {
  const { t } = useTranslation("");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Local state for optimistic updates during drag-and-drop
  const [localVacancies, setLocalVacancies] = useState<Vacancy[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vacancyToDelete, setVacancyToDelete] = useState<Vacancy | null>(null);

  const token = localStorage.getItem("access_token") || "";

  // Sync local state with props when props change
  useEffect(() => {
    setLocalVacancies(propVacancies);
  }, [propVacancies]);

  const handleDeleteClick = (vacancy: Vacancy) => {
    setVacancyToDelete(vacancy);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!vacancyToDelete) return;

    // Use the prop onDelete if available
    // Note: Parent onDelete might have its own confirmation, but here we use the Modal.
    // If the parent has a window.confirm, it might be redundant.
    // Ideally we should unify this, but for now calling the parent handler is safer for consistency.
    try {
      onDelete(vacancyToDelete.id);
    } catch (error) {
      console.error("Error deleting vacancy via prop:", error);
    } finally {
      setDeleteModalOpen(false);
      setVacancyToDelete(null);
    }
  };

  // Vakansiyani tahrirlash
  const handleEdit = (vacancy: Vacancy) => {
    if (onEdit) {
      onEdit(vacancy);
    } else {
      console.log("Edit vacancy:", vacancy);
    }
  };
  //

  // some chackes

  const handleOnDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(filteredVacancies);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update UI immediately for smooth UX (optimistic update)
    setLocalVacancies(items);

    // Send reorder request to backend asynchronously
    const ids = items.map((v) => v.id);
    try {
      await apiService.reOrderVacancy(
        token,
        user?.public_key,
        user?.site_domain,
        ids,
      );
      // Optionally refresh to sync with backend
      onRefresh();
    } catch (error) {
      console.error("Failed to reorder vacancies:", error);
      // Revert or refresh on error
      onRefresh();
    }
  };

  const filteredVacancies = localVacancies.filter(
    (v) =>
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-5">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 sm:max-w-md">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder={t("search.placeholder")}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full sm:w-[300px] max-h-10 pl-12 pr-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <Select
              value={selectedSite ? JSON.stringify(selectedSite) : ""}
              onValueChange={(val) => onSiteSelect?.(JSON.parse(val))}
            >
              <SelectTrigger className="w-auto max-w-48 h-10 min-w-34 rounded-xl bg-[#0a1b30] border border-white/10 text-white">
                <SelectValue>
                  {selectedSite?.name || t("siteSelect.placeholder")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#0a1b30] border border-white/10 text-white">
                {user?.sites?.map((site: Site, index: number) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={site.id || index}
                    value={JSON.stringify(site)}
                  >
                    {site.site_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* 
						<button
							onClick={onCreate}
							// onClick={() => navigate("/dashboard/createVacation")}
							disabled={actionLoading}
							className='flex items-center cursor-pointer gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 max-h-10 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg font-medium'
						>
							<Plus size={20} />
							{t("createButton")}
						</button> */}
            <button
              // onClick={onCreate}
              onClick={() => navigate("/dashboard/createVacation")}
              disabled={actionLoading}
              className="flex items-center cursor-pointer gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 max-h-10 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg font-medium"
            >
              <Plus size={20} />
              {t("createButton")}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">{t("loading")}</p>
        </div>
      ) : filteredVacancies.length === 0 ? (
        <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 rounded-2xl border border-white/10 p-12 text-center">
          <Briefcase className="h-10 w-10 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white">
            {t("empty.noResults")}
          </h3>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="vacancies-droppable">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid gap-4"
              >
                {filteredVacancies.map((vacancy, index) => (
                  <Draggable
                    key={vacancy.id}
                    draggableId={String(vacancy.id)}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`${
                          snapshot.isDragging
                            ? "z-50 ring-2 ring-blue-500/50 rounded-xl"
                            : ""
                        }`}
                      >
                        <VacancyCard
                          vacancy={vacancy}
                          onEdit={handleEdit}
                          onDelete={() => handleDeleteClick(vacancy)}
                          isLoading={actionLoading}
                          selectedSite={selectedSite}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Note: The parent handles deletion via onDelete, but we keep the visual modal here or in parent? 
          Since onDelete passed from parent currently does window.confirm, this Modal might be redundant or conflict.
          However, to preserve UI, we used this modal. 
          WARNING: If parent also confirms, user will click 'Delete' in Modal, then get a browser Alert.
          The user should verify VacanciesPage.tsx handleDeleteVacancy.
      */}
      <VacancyDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        vacancyTitle={vacancyToDelete?.title}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default VacanciesList;

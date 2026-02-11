import { useState, useEffect, type FC } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../contexts/AuthContext";
import { apiService } from "../../../services/api";

import {
  Plus,
  Globe,
  Trash2,
  Settings,
  Edit,
  Server,
  CheckCircle,
  XCircle,
} from "lucide-react";

import WidgetConfigurator from "../../../components/WidgetConfigurator";
import SiteDeleteModal from "./SiteDeleteModal";
import EditSiteModal from "./SiteEditModal";

interface Site {
  id: number;
  site_name: string;
  is_new: boolean;
  public_key?: string;
  domain?: string;
  domain_id?: number;
  is_active?: boolean;
}

// interface AddSiteResult {
//   id?: number;
//   public_key: string;
// }

const SitesPage: FC = () => {
  const { t } = useTranslation();
  const { token } = useAuth();

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [siteToEdit, setSiteToEdit] = useState<Site | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    domain: "",
  });

  useEffect(() => {
    loadSites();
  }, [editModalOpen]);

  const loadSites = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await apiService.getSites(token);
      const uniqueData = Array.from(new Map(data.map((item: any) => [item.id, item])).values());
      setSites(
        uniqueData.map((s: any) => ({
          ...s,
          is_new: false,
        }))
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        t("sitesPage.alerts.loadError") ||
        "Failed to load sites"
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalSites = sites.length;
  const activeSites = sites.filter((s) => s.is_active).length;
  const inactiveSites = sites.filter((s) => !s.is_active).length;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (
      !formData.domain.startsWith("http://") &&
      !formData.domain.startsWith("https://")
    ) {
      toast.error(t("sitesPage.alerts.domainError") || "Invalid domain");
      return;
    }

    setIsAdding(true);
    const toastId = toast.loading(t("sitesPage.alerts.adding"));

    try {
      await apiService.addSite(formData.name, formData.domain, token);

      toast.update(toastId, {
        render: t("sitesPage.alerts.addSuccess"),
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      setFormData({ name: "", domain: "" });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      toast.update(toastId, {
        render: err?.response?.data?.message || "Failed to add site",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteClick = (site: Site) => {
    setSiteToDelete(site);
    setDeleteModalOpen(true);
  };

  const confirmDeleteSite = async () => {
    if (!siteToDelete || !token) return;

    setDeleting(true);
    const toastId = toast.loading("Deleting site...");

    try {
      await apiService.deleteSite(siteToDelete.id, token);

      toast.update(toastId, {
        render: "Site deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      setSites((prev) => prev.filter((s) => s.id !== siteToDelete.id));
      setDeleteModalOpen(false);
      setSiteToDelete(null);
    } catch {
      toast.update(toastId, {
        render: "Failed to delete site",
        type: "error",
        isLoading: false,
      });
    } finally {
      setDeleting(false);
    }
  };

  const openConfig = (site: Site) => {
    setSelectedSite(site);
    setShowConfig(true);
  };

  const closeConfig = () => {
    setShowConfig(false);
    setSelectedSite(null);
  };

  const handleEditClick = (site: Site) => {
    setSiteToEdit(site);
    setEditModalOpen(true);
  };

  const handleUpdateName = async (newName: string) => {
    if (!siteToEdit || !token) return;

    const toastId = toast.loading("Updating name...");

    try {
      await apiService.updateSiteName(siteToEdit.id, newName, token);

      setSites((prev) =>
        prev.map((s) =>
          s.id === siteToEdit.id ? { ...s, site_name: newName } : s
        )
      );

      toast.update(toastId, {
        render: "Name updated!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      setEditModalOpen(false);
    } catch {
      toast.update(toastId, {
        render: "Failed to update site name",
        type: "error",
        isLoading: false,
      });
    }
  };

  const handleUpdateDomain = async (newDomain: string) => {
    if (!siteToEdit || !token) return;

    const toastId = toast.loading("Updating domain...");

    try {
      if (!siteToEdit.domain_id) throw new Error("Missing domain ID");

      const updated = await apiService.updateSiteDomain(
        siteToEdit.domain_id,
        newDomain,
        token
      );

      setSites((prev) =>
        prev.map((s) =>
          s.id === siteToEdit.id ? { ...s, domain: updated.detail } : s
        )
      );

      toast.update(toastId, {
        render: "Domain updated!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      setEditModalOpen(false);
    } catch (err: any) {
      toast.update(toastId, {
        render: err.message || "Failed to update domain",
        type: "error",
        isLoading: false,
      });
    }
  };

  if (showConfig && selectedSite) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <WidgetConfigurator site={selectedSite} onClose={closeConfig} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t("sitesPage.header.title")}
        </h1>
        <p className="text-gray-400">{t("sitesPage.header.subtitle")}</p>
      </div>
      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Total Sites */}
        <div className="bg-gradient-to-br from-[#0f2a43]/60 to-[#0a1b30]/60 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 group-hover:scale-110 transition-transform">
              <Server className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {t("sitesPage.stats.total")}
              </p>
              <p className="text-2xl font-bold text-white">{totalSites}</p>
            </div>
          </div>
        </div>

        {/* Active Sites */}
        <div className="bg-gradient-to-br from-[#0f2a43]/60 to-[#0a1b30]/60 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-green-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 group-hover:scale-110 transition-transform">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {t("sitesPage.stats.active")}
              </p>
              <p className="text-2xl font-bold text-white">{activeSites}</p>
            </div>
          </div>
        </div>

        {/* Inactive Sites */}
        <div className="bg-gradient-to-br from-[#0f2a43]/60 to-[#0a1b30]/60 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-red-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 group-hover:scale-110 transition-transform">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {t("sitesPage.stats.inactive")}
              </p>
              <p className="text-2xl font-bold text-white">{inactiveSites}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Site Form */}
      <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          {t("sitesPage.addForm.title")}
        </h2>
        <form onSubmit={handleAddSite} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("sitesPage.addForm.nameLabel")}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full rounded-lg px-4 py-3 bg-[#0a1b30]/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder={t("sitesPage.addForm.namePlaceholder")}
                required
                disabled={isAdding}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("sitesPage.addForm.domainLabel")}
              </label>
              <input
                type="url"
                name="domain"
                value={formData.domain}
                onChange={handleInputChange}
                className="w-full rounded-lg px-4 py-3 bg-[#0a1b30]/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder={t("sitesPage.addForm.domainPlaceholder")}
                required
                disabled={isAdding}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isAdding}
            className="w-full cursor-pointer flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 font-medium"
          >
            {isAdding && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {!isAdding && <Plus size={20} />}
            {isAdding
              ? t("sitesPage.addForm.submitting") || "Adding..."
              : t("sitesPage.addForm.submitButton") || "Add Site"}
          </button>
        </form>
      </div>

      {/* Sites List */}
      <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {t("sitesPage.list.title")}
          </h2>
        </div>

        {loading ? (
          <div className="p-20 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-400">{t("sitesPage.list.loading")}</p>
          </div>
        ) : sites.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
              <Globe className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              {t("sitesPage.list.empty.title")}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {t("sitesPage.list.empty.description")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {sites.map((site) => (
              <div
                key={site.id}
                className="p-6 hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                      <Globe className="h-6 w-6 text-blue-400" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {site.site_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${site.is_active
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                            }`}
                        >
                          {!site.is_active === false
                            ? t("sitesPage.list.statusActive")
                            : t("sitesPage.list.statusInactive")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(site)}
                      className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl font-medium transition-all"
                    >
                      <Edit size={18} />
                      {t("sitesPage.list.editButton")}
                    </button>
                    <button
                      onClick={() => openConfig(site)}
                      className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl font-medium transition-all"
                    >
                      <Settings size={18} />
                      {t("sitesPage.list.configButton")}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(site)}
                      className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-medium transition-all"
                    >
                      <Trash2 size={18} />
                      {t("sitesPage.list.deleteButton")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals - Moved outside the sites list */}
      <EditSiteModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        site={siteToEdit}
        onUpdateName={handleUpdateName}
        onUpdateDomain={handleUpdateDomain}
      />

      <SiteDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteSite}
        siteName={siteToDelete?.site_name}
        isLoading={deleting}
      />
    </div>
  );
};

export default SitesPage;

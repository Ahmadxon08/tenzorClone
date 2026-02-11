import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EditSiteModalProps {
  open: boolean;
  onClose: () => void;
  site: {
    id: number;
    site_name: string;
    domain?: string;
    public_key?: string;
  } | null;
  onUpdateName: (newName: string) => void;
  onUpdateDomain: (newDomain: string) => void;
  isLoading?: boolean;
}

const EditSiteModal: React.FC<EditSiteModalProps> = ({
  open,
  onClose,
  site,
  onUpdateName,
  onUpdateDomain,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(site?.site_name || "");
  const [domain, setDomain] = useState(site?.domain || "");

  // Update fields when site changes
  useEffect(() => {
    setName(site?.site_name || "");
    setDomain(site?.domain || "");
  }, [site]);

  if (!site) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] bg-gradient-to-br from-[#0a1b30] to-[#071226] border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-blue-400">
            <Pencil size={20} /> {t("sitesPage.list.editModal.title")}
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-300 mt-1 text-sm">
          {t("sitesPage.list.editModal.message", { title: site.site_name })}
        </p>

        {/* Edit Name */}
        <div className="mt-5 space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            {t("sitesPage.list.editModal.nameLabel")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg px-4 py-3 bg-[#0a1b30]/70 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder={t("sitesPage.list.editModal.namePlaceholder")}
          />
          <button
            onClick={() => onUpdateName(name)}
            disabled={isLoading}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
          >
            {isLoading
              ? t("sitesPage.list.editModal.saving")
              : t("sitesPage.list.editModal.saveName")}
          </button>
        </div>

        {/* Edit Domain */}
        <div className="mt-6 space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            {t("sitesPage.list.editModal.domainLabel")}
          </label>
          <input
            type="url"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full rounded-lg px-4 py-3 bg-[#0a1b30]/70 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            placeholder={t("sitesPage.list.editModal.domainPlaceholder")}
          />
          <button
            onClick={() => onUpdateDomain(domain)}
            disabled={isLoading}
            className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
          >
            {isLoading
              ? t("sitesPage.list.editModal.saving")
              : t("sitesPage.list.editModal.saveDomain")}
          </button>
        </div>

        <DialogFooter className="pt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full border border-white/20 text-gray-300 px-4 py-2 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {t("sitesPage.list.editModal.cancel")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSiteModal;

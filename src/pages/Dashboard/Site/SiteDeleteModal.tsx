import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SiteDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  siteName?: string;
  isLoading?: boolean;
}

const SiteDeleteModal: React.FC<SiteDeleteModalProps> = ({
  open,
  onClose,
  onConfirm,
  siteName,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-gradient-to-br from-[#0a1b30] to-[#071226] border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-red-400">
            <Trash2 size={20} /> {t("sitesPage.list.deleteModal.title")}
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-300 mt-2 text-sm">
          {t("sitesPage.list.deleteModal.message", { title: siteName })}
        </p>

        <DialogFooter className="gap-3 sm:gap-2 pt-5">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2 rounded-lg border border-white/20 text-gray-300 hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {t("sitesPage.list.deleteModal.cancel")}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all disabled:opacity-50"
          >
            {isLoading
              ? t("sitesPage.list.deleteModal.deleting")
              : t("sitesPage.list.deleteModal.delete")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SiteDeleteModal;

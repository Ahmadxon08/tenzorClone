import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  vacancyTitle?: string; 
  isLoading?: boolean;
}

const VacancyDeleteModal: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  vacancyTitle,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-gradient-to-br from-[#0a1b30] to-[#071226] border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-red-400">
            <Trash2 size={20} /> {t("vacancyCard.vacancyModal.title")}
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-300 mt-2 text-sm">
          {t("vacancyCard.vacancyModal.message", {
            title: vacancyTitle || "",
          })}
        </p>

        <DialogFooter className="gap-3 sm:gap-2 pt-5">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2 rounded-lg border border-white/20 text-gray-300 hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {t("vacancyCard.vacancyModal.cancel")}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all disabled:opacity-50"
          >
            {isLoading
              ? t("vacancyCard.vacancyModal.deleting", "O‘chirilmoqda...")
              : t("vacancyCard.vacancyModal.delete")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VacancyDeleteModal;

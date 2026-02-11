// src/components/common/ConfirmModal.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  icon,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-[#0b1627] border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-red-400">
            {icon || <AlertTriangle size={20} />} {title || t("adminDashboard.common.confirm")}
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-300 mt-2 text-sm">{message}</p>

        <DialogFooter className="gap-3 sm:gap-2 pt-5">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2 rounded-lg border border-white/20 text-gray-300 hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {cancelText || t("adminDashboard.common.cancel")}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all disabled:opacity-50"
          >
            {isLoading ? t("adminDashboard.common.loading") : confirmText || t("adminDashboard.common.confirm")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;

import React from "react";
import { CheckCircle } from "lucide-react";

interface InterviewResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const InterviewResultModal: React.FC<InterviewResultModalProps> = ({
  isOpen,
}) => {
  const handleCloseAndRedirect = () => {
    window.location.href = 'https://jobx.uz/';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-500/20 mb-6">
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Muvaffaqiyatli qo'shildingiz!</h2>
          <p className="text-gray-300 mb-6">
            Arizangiz muvaffaqiyatli qabul qilindi. Tez orada siz bilan bog'lanamiz.
          </p>

          

          <button
            onClick={handleCloseAndRedirect}
            className="mt-8 w-full px-8 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl transition-all active:scale-95"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewResultModal;

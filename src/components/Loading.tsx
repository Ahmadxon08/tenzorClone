import i18n from "../i18n/config";

const Loading = () => {
  const { t } = i18n;
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-400">
          {t("common.loading") || "Yuklanmoqda..."}
        </p>
      </div>
    </div>
  );
};

export default Loading;

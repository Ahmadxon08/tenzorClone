// components/dashboard/WidgetInfo.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Copy, Check } from 'lucide-react';

interface WidgetInfoProps {
  user: {
    public_key: string;
    site_domain: string;
    site_name: string;
  };
}

const WidgetInfo: React.FC<WidgetInfoProps> = ({ user }) => {
  const { t } = useTranslation("widgetInfo");
  const [copied, setCopied] = React.useState(false);

  const widgetCode = `<script src="https://widget.example.com/v1/${user.public_key}.js"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Widget Script */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{t("widgetInfo.widgetCode.title")}</h3>
        <div className="bg-gray-50 rounded border border-gray-200 p-3">
          <code className="text-xs text-gray-700 break-all">
            {widgetCode}
          </code>
        </div>
        <button
          onClick={handleCopy}
          className="w-full cursor-pointer mt-3 flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {copied ? (
            <>
              <Check size={14} />
              {t("widgetInfo.widgetCode.copied")}
            </>
          ) : (
            <>
              <Copy size={14} />
              {t("widgetInfo.widgetCode.copy")}
            </>
          )}
        </button>
      </div>

      {/* Site Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{t("widgetInfo.siteInfo.title")}</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">{t("widgetInfo.siteInfo.publicKey")}</p>
            <p className="font-mono text-xs bg-gray-50 p-2 rounded border break-all">
              {user.public_key}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{t("widgetInfo.siteInfo.domain")}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-900 flex-1">{user.site_domain}</p>
              <button
                onClick={() => window.open(user.site_domain, '_blank')}
                className="p-1 cursor-pointer text-gray-400 hover:text-blue-600 transition-colors"
                title={t("widgetInfo.siteInfo.openSite")}
              >
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
        <h3 className="text-sm font-semibold mb-1">{t("widgetInfo.help.title")}</h3>
        <p className="text-xs opacity-90 mb-3">
          {t("widgetInfo.help.text")}
        </p>
        <button className="w-full cursor-pointer bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all">
          {t("widgetInfo.help.view")}
        </button>
      </div>
    </div>
  );
};

export default WidgetInfo;
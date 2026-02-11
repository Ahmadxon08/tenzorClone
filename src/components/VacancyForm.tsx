// components/VacancyForm.tsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Vacancy, VacancyFormData } from "../types/index";

interface VacancyFormProps {
  vacancy?: Vacancy;
  onSave: (vacancy: VacancyFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const VacancyForm: React.FC<VacancyFormProps> = ({
  vacancy,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<VacancyFormData>({
    title: "",
    description: "",
    from_price: 0,
    to_price: 0,
    valyuta: "$",
  });
  const [errors, setErrors] = useState<Partial<VacancyFormData>>({});

  useEffect(() => {
    if (vacancy) {
      setFormData({
        title: vacancy.title,
        description: vacancy.description,
        from_price: vacancy.from_price,
        to_price: vacancy.to_price,
        valyuta: vacancy.valyuta,
      });
    }
  }, [vacancy]);

  const validateForm = (): boolean => {
    const newErrors: Partial<VacancyFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Sarlavha kiritilishi shart";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Tavsif kiritilishi shart";
    }

    if (formData.from_price !== undefined && formData.from_price <= 0) {
      newErrors.from_price = Number("Minimum narx 0 dan katta bo'lishi kerak");
    }

    if (formData.to_price !== undefined && formData.to_price <= 0) {
      newErrors.to_price = Number("Maximum narx 0 dan katta bo'lishi kerak");
    }

    if (formData.from_price !== undefined && formData.to_price !== undefined && formData.from_price >= formData.to_price) {
      newErrors.to_price = Number("Maximum narx minimum narxdan katta bo'lishi kerak");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("price") ? Number(value) : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof VacancyFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving vacancy:", error);
    }
  };

  return (
    <div className="fixed inset-0  bg-[#dedede5e] backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {vacancy ? "Vakansiyani tahrirlash" : "Yangi vakansiya"}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sarlavha *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.title ? "border-red-300" : "border-gray-300"
                }`}
              placeholder="Vakansiya nomi"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tavsif *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical ${errors.description ? "border-red-300" : "border-gray-300"
                }`}
              placeholder="Vakansiya haqida batafsil ma'lumot..."
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum narx *
              </label>
              <input
                type="number"
                name="from_price"
                value={formData.from_price}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.from_price ? "border-red-300" : "border-gray-300"
                  }`}
                placeholder="0"
                min="0"
                disabled={isLoading}
              />
              {errors.from_price && (
                <p className="text-red-600 text-sm mt-1">{errors.from_price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum narx *
              </label>
              <input
                type="number"
                name="to_price"
                value={formData.to_price}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.to_price ? "border-red-300" : "border-gray-300"
                  }`}
                placeholder="0"
                min="0"
                disabled={isLoading}
              />
              {errors.to_price && (
                <p className="text-red-600 text-sm mt-1">{errors.to_price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valyuta *
              </label>
              <select
                name="valyuta"
                value={formData.valyuta}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isLoading}
              >
                <option value="$">USD ($)</option>
                <option value="So'm">So'm</option>
                <option value="€">EUR (€)</option>
                <option value="₽">RUB (₽)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 cursor-pointer bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saqlanmoqda...
                </span>
              ) : vacancy ? (
                "Saqlash"
              ) : (
                "Yaratish"
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 cursor-pointer bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Bekor qilish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VacancyForm;

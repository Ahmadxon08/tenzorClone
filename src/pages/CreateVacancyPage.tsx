import { Briefcase, DollarSign, FileText, Plus } from "lucide-react";
import { useState } from "react";
interface VacancyData {
  title: string;
  description: string;
  price: string;
}
interface VacancyResponse extends VacancyData {
  id: number;
}
const CreateVacancyPage: React.FC = () => {
  const [formData, setFormData] = useState<VacancyData>({
    title: "",
    description: "",
    price: ""
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const API_URL = "https://chatai.my-blog.uz/vakansiya/";
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
  };
  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.price.trim()) {
      setErrorMessage("Barcha maydonlarni to'ldiring!");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const result: VacancyResponse = await response.json();
        setSuccessMessage(`Vakansiya muvaffaqiyatli yaratildi! ID: ${result.id}`);
        setFormData({
          title: "",
          description: "",
          price: ""
        });
      } else {
        throw new Error("Vakansiya yaratishda xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Xatolik:", error);
      setErrorMessage("Server bilan bog'lanishda xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: ""
    });
    setErrorMessage("");
    setSuccessMessage("");
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4" />
                Vakansiya nomi
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Masalan: Frontend Developer"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Vakansiya tavsifi
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={8}
                placeholder="Vakansiya haqida batafsil ma'lumot, talablar, mas'uliyatlar..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-vertical min-h-[120px]"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="price" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4" />
                Maosh
              </label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Masalan: 5,000,000 - 8,000,000 so'm"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={isLoading}
              />
            </div>
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            )}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">{successMessage}</p>
              </div>
            )}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`flex-1 cursor-pointer py-3 px-6 rounded-lg font-medium transition-all ${isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                  }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Yuklanmoqda...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Vakansiya Yaratish
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={isLoading}
                className="px-6 py-3 border cursor-pointer border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Tozalash
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVacancyPage;
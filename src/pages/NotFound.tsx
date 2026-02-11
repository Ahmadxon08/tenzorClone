import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-6">
            <h1 className="text-7xl font-bold text-gray-900">404</h1>
            <p className="mt-2 text-lg text-gray-600">Sahifa topilmadi</p>
            <button
                onClick={handleGoBack}
                className="mt-6 px-6 cursor-pointer py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
                Bosh sahifaga qaytish
            </button>
        </div>
    );
};

export default NotFound;

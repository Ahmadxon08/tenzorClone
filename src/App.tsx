// App.tsx
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
// import IntegratedChatVacancy from "./components/IntegratedChatVacancy";
import { AuthProvider } from "./contexts/AuthContext";
import WidgetProvider from "./contexts/WidgetProvider";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./i18n/config";
import DashboardLayout from "./layouts/DashboardLayout";
import ApplicationsPage from "./pages/Dashboard/Applications/ApplicationsPage";
import SettingsPage from "./pages/Dashboard/SettingsPage";
import SitesPage from "./pages/Dashboard/Site/Site";
import StatisticsPage from "./pages/Dashboard/StatisticsPage";
import VacanciesPage from "./pages/Dashboard/VacanciesPage";
import LoginPage from "./pages/auth/login/Login";
import RegisterPage from "./pages/auth/register/Register";
import type { WidgetConfig } from "./types/widget";
import TestsPage from "./pages/Dashboard/Test/TestsPage";
import ChatInterview from "./pages/Dashboard/Test/ChatInterview";
import Results from "./pages/Dashboard/results";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import UsersPage from "./pages/AdminDashboard/UsersPage";
import AdminSettings from "./pages/AdminDashboard/AdminSettings";
import ChatAI from "./pages/Mock/ChatAI";
import CompanyInfoPage from "./pages/AdminDashboard/Companies/CompanyInfoPage";
// import ResetPassword from "./pages/auth/resetPassword/resetPassword";
import UserRequests from "./pages/AdminDashboard/UserRequests";
import ChatInterviewForUser from "./pages/Dashboard/Test/ChatInterviewForUser";
import CompanyProfileGuard from "./components/CompanyProfileGuard";
import { AdminRoute } from "./components/AdminRoute";
import { UserRoute } from "./components/UserRoute";
// import VideoAssessment from "./pages/Dashboard/AIInterview/VideoAssessment";
// import PlansPage from "./pages/PlansPage";
// import CandidateProfilePage from "./pages/CandidateProfilePage";
import VacancyFormPage from "./pages/Dashboard/createVacation/CreateVacationPage";
import SetCode from "./pages/auth/set-code/setCode";
import ResetPasswordPage from "./pages/auth/resendCode/ResetPasswordPage";

interface AppProps {
  tenantId: string;
  widgetConfig?: WidgetConfig;
}

function App({ tenantId, widgetConfig }: AppProps) {
  useEffect(() => {
    console.log("App initialized tenantId:", tenantId);
    console.log("widgetConfig in App:", widgetConfig);
  }, [tenantId, widgetConfig]);

  return (
    <>
      <AuthProvider>
        <WidgetProvider config={widgetConfig}>
          <div
            className="min-h-screen font-inter"
            //  style={{
            //   background:
            //     "radial-gradient(70% 55% at 50% 50%, #2a5d77 0%, #184058 18%, #0f2a43 34%, #0a1b30 50%, #071226 66%, #040d1c 80%, #020814 92%, #01040d 97%, #000309 100%), radial-gradient(160% 130% at 10% 10%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%), radial-gradient(160% 130% at 90% 90%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%)",
            // }}
          >
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* <Route path="/" element={<IntegratedChatVacancy />} /> */}
              {/* <Route path="/plans" element={<PlansPage />} /> */}
              {/* <Route path="/candidate/:id" element={<CandidateProfilePage />} />
              <Route path="/reset-password" element={<ResetPassword />} /> */}
              <Route path="/set-code" element={<SetCode />} />
              {/* <Route path="/video-assessment" element={<VideoAssessment />} /> */}
              <Route
                path="/test/interview"
                element={<ChatInterviewForUser />}
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="adminSettings" element={<AdminSettings />} />
                <Route
                  path="adminApplications"
                  element={<ApplicationsPage />}
                />
                <Route path="adminCompanies" element={<CompanyInfoPage />} />
                <Route path="requests" element={<UserRequests />} />
              </Route>
              <Route
                path="/dashboard"
                element={
                  <UserRoute>
                    <CompanyProfileGuard />
                  </UserRoute>
                }
              >
                <Route
                  index
                  element={<Navigate to="/dashboard/vacancies" replace />}
                />
                <Route element={<DashboardLayout />}>
                  <Route path="vacancies" element={<VacanciesPage />} />

                  <Route path="createVacation" element={<VacancyFormPage />} />
                  <Route path="sites" element={<SitesPage />} />
                  <Route path="test" element={<TestsPage />} />
                  <Route path="interview" element={<ChatInterview />} />
                  <Route path="applications" element={<ApplicationsPage />} />
                  <Route path="statistics" element={<StatisticsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="results" element={<Results />} />
                  <Route path="testAI" element={<ChatAI />} />
                  <Route path="vacancy/:id" element={<></>} />
                </Route>
              </Route>

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </WidgetProvider>
      </AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;

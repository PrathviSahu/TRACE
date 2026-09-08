import { Routes, Route } from "react-router-dom";
import DSABrain from "./components/DSABrain.jsx";
import Navbar from "./components/Navbar.jsx";
import VisualizerPage from "./pages/VisualizerPage.jsx";
import RoadmapPage from "./pages/RoadmapPage.jsx";
import ProblemsPage from "./pages/ProblemsPage.jsx";
import DataStructuresPage from "./pages/DataStructuresPage.jsx";
import CompaniesPage from "./pages/CompaniesPage.jsx";
import CompanyDetailPage from "./pages/CompanyDetailPage.jsx";
import InterviewSetupPage from "./pages/InterviewSetupPage.jsx";
import InterviewPlanPage from "./pages/InterviewPlanPage.jsx";
import LearnPage from "./pages/LearnPage.jsx";

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Routes>
        <Route path="/"                         element={<VisualizerPage />} />
        <Route path="/roadmap"                  element={<RoadmapPage />} />
        <Route path="/problems"                 element={<ProblemsPage />} />
        <Route path="/data-structures"          element={<DataStructuresPage />} />
        <Route path="/companies"                element={<CompaniesPage />} />
        <Route path="/companies/:companyId"     element={<CompanyDetailPage />} />
        <Route path="/interview/setup"          element={<InterviewSetupPage />} />
        <Route path="/interview/plan"           element={<InterviewPlanPage />} />
        <Route path="/learn"                    element={<LearnPage />} />
      </Routes>
      <DSABrain />
    </div>
  );
}

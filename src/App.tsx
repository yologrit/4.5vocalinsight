import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import CoachPage from "./pages/CoachPage.tsx";
import VocalNotesPage from "./pages/VocalNotesPage.tsx";
import VocalNotesLibraryPage from "./pages/VocalNotesLibraryPage.tsx";
import VocalAnalysisPage from "./pages/VocalAnalysisPage.tsx";
import PracticeRecordsPage from "./pages/PracticeRecordsPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import Onboarding from "./pages/Onboarding.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/coach" element={<CoachPage />} />
          <Route path="/vocal-notes" element={<VocalNotesPage />} />
          <Route path="/vocal-notes-library" element={<VocalNotesLibraryPage />} />
          <Route path="/vocal-analysis" element={<VocalAnalysisPage />} />
          <Route path="/practice-records" element={<PracticeRecordsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

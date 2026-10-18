import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { HomePage } from './pages/HomePage.js';
import { QuestionsPage } from './pages/QuestionsPage.js';
import { QuestionDetailPage } from './pages/QuestionDetailPage.js';
import { MCQPracticePage } from './pages/MCQPracticePage.js';
import { ExamsPage } from './pages/ExamsPage.js';
import { ExamTakePage } from './pages/ExamTakePage.js';
import { ExamResultPage } from './pages/ExamResultPage.js';
import { MyResultsPage } from './pages/MyResultsPage.js';
import { PremiumPage } from './pages/PremiumPage.js';
import { NoticesPage } from './pages/NoticesPage.js';
import { BookmarksPage } from './pages/BookmarksPage.js';
import { LeaderboardPage } from './pages/LeaderboardPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { PaidDashboardPage } from './pages/PaidDashboardPage.js';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/questions" element={<QuestionsPage />} />
              <Route path="/questions/:slug" element={<QuestionDetailPage />} />
              <Route path="/mcq-practice" element={<MCQPracticePage />} />
              <Route path="/exams" element={<ExamsPage />} />
              <Route path="/exams/:slug" element={<ExamTakePage />} />
              <Route path="/results/:attemptId" element={<ExamResultPage />} />
              <Route path="/my-results" element={<MyResultsPage />} />
              <Route path="/dashboard" element={<PaidDashboardPage />} />
              <Route path="/student-dashboard" element={<PaidDashboardPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/premium" element={<PremiumPage />} />
              <Route path="/notices" element={<NoticesPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

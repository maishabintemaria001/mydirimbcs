import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { AdSlot } from './components/AdSlot.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
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
import { LoginPage } from './pages/LoginPage.js';
import { SearchResultsPage } from './pages/SearchResultsPage.js';
import { ThemeProvider } from './context/ThemeContext.js';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-200 overflow-x-hidden">
            <Header />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<LoginPage />} />
              <Route path="/questions" element={<QuestionsPage />} />
              <Route path="/questions/:slug" element={<QuestionDetailPage />} />
              <Route path="/mcq-practice" element={<MCQPracticePage />} />
              <Route path="/exams" element={<ExamsPage />} />
              <Route path="/exams/:slug" element={<ExamTakePage />} />
              <Route path="/results/:attemptId" element={<ExamResultPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/premium" element={<PremiumPage />} />
              <Route path="/notices" element={<NoticesPage />} />

              {/* Protected Student Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <PaidDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student-dashboard" 
                element={
                  <ProtectedRoute>
                    <PaidDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-results" 
                element={
                  <ProtectedRoute>
                    <MyResultsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bookmarks" 
                element={
                  <ProtectedRoute>
                    <BookmarksPage />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Admin & Content Staff Route */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'content_manager', 'exam_manager']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Footer Google AdSense Banner Slot */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <AdSlot placement="footer" />
          </div>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  );
}

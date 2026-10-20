import React from 'react';

interface SkeletonProps {
  className?: string;
}

/**
 * Base atomic Skeleton box with shimmer animation and dark-mode styling
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-slate-200/90 dark:bg-slate-800/90 ${className}`}
    />
  );
};

// 1. Question Paper Card Skeleton (List of question papers)
export const QuestionPaperSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-20 h-5 rounded-md" />
              <Skeleton className="w-12 h-5 rounded-md" />
              <Skeleton className="w-24 h-5 rounded-md" />
            </div>
            <Skeleton className="w-20 h-6 rounded-full" />
          </div>

          <div className="space-y-2.5">
            <Skeleton className="w-4/5 h-6 rounded-md" />
            <Skeleton className="w-3/5 h-4 rounded-md" />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-24 h-4 rounded-md" />
              <Skeleton className="w-24 h-4 rounded-md" />
            </div>
            <Skeleton className="w-28 h-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

// 2. Question Detail / MCQ Item Skeleton (For question reading and exam taking)
export const QuestionDetailSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner Skeleton */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-24 h-5 rounded-md" />
          <Skeleton className="w-28 h-6 rounded-full" />
        </div>
        <Skeleton className="w-3/4 h-8 rounded-lg" />
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Skeleton className="w-28 h-5 rounded-md" />
          <Skeleton className="w-28 h-5 rounded-md" />
          <Skeleton className="w-28 h-5 rounded-md" />
        </div>
      </div>

      {/* MCQ Items List Skeleton */}
      <div className="space-y-5">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="w-12 h-5 rounded-md" />
                <Skeleton className="w-full h-5 rounded-md" />
                <Skeleton className="w-4/5 h-5 rounded-md" />
              </div>
              <Skeleton className="w-16 h-6 rounded-md shrink-0" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <Skeleton className="w-32 h-6 rounded-md" />
              <Skeleton className="w-20 h-6 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Exam List Skeleton (For online mock exam cards)
export const ExamListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-24 h-5 rounded-md" />
              <Skeleton className="w-16 h-5 rounded-md" />
              <Skeleton className="w-28 h-5 rounded-md" />
            </div>
            <Skeleton className="w-24 h-6 rounded-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="w-3/4 h-6 rounded-md" />
            <Skeleton className="w-full h-4 rounded-md" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Skeleton className="w-40 h-4 rounded-md" />
            <Skeleton className="w-32 h-9 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

// 4. Exam Result Skeleton (For exam results analysis)
export const ExamResultSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Result Card Hero */}
      <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6 text-center">
        <Skeleton className="w-20 h-20 rounded-full mx-auto" />
        <div className="space-y-2 max-w-sm mx-auto">
          <Skeleton className="w-3/4 h-7 rounded-md mx-auto" />
          <Skeleton className="w-1/2 h-5 rounded-md mx-auto" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>

      {/* Detailed questions review skeleton */}
      <div className="space-y-4">
        <Skeleton className="w-48 h-6 rounded-md" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    </div>
  );
};

// 5. Dashboard Skeleton (For Admin & Paid Student Dashboards)
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Profile & KPI Strip */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="w-48 h-6 rounded-md" />
            <Skeleton className="w-64 h-4 rounded-md" />
          </div>
          <Skeleton className="w-28 h-8 rounded-lg" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
          >
            <Skeleton className="w-20 h-4 rounded-md" />
            <Skeleton className="w-16 h-7 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Table / Tab Content Skeleton */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <Skeleton className="w-44 h-6 rounded-md" />
          <Skeleton className="w-32 h-8 rounded-lg" />
        </div>
        <div className="space-y-3">
          <Skeleton className="w-full h-12 rounded-xl" />
          <Skeleton className="w-full h-12 rounded-xl" />
          <Skeleton className="w-full h-12 rounded-xl" />
          <Skeleton className="w-full h-12 rounded-xl" />
          <Skeleton className="w-full h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

// 6. Leaderboard & Analytics Skeleton (Podium + Chart + Table)
export const LeaderboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Skeleton */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        <Skeleton className="w-48 h-6 rounded-md" />
        <Skeleton className="w-72 h-4 rounded-md" />
      </div>

      {/* Top 3 Podium Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>

      {/* Chart Box Skeleton */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="w-48 h-6 rounded-md" />
          <Skeleton className="w-36 h-8 rounded-lg" />
        </div>
        <Skeleton className="w-full h-64 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        <Skeleton className="w-56 h-6 rounded-md mb-2" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-40 h-4 rounded-md" />
            </div>
            <Skeleton className="w-20 h-4 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
};

// 7. Skills Heatmap Skeleton
export const SkillsHeatmapSkeleton: React.FC = () => {
  return (
    <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-2">
          <Skeleton className="w-64 h-6 rounded-md" />
          <Skeleton className="w-80 h-4 rounded-md" />
        </div>
        <Skeleton className="w-32 h-8 rounded-lg" />
      </div>

      {/* Matrix Area */}
      <Skeleton className="w-full h-80 rounded-2xl" />

      {/* Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </div>
  );
};

// 8. Notices / Bookmarks List Skeleton
export const NoticeSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
        >
          <div className="flex justify-between items-center">
            <Skeleton className="w-24 h-4 rounded-md" />
            <Skeleton className="w-20 h-4 rounded-md" />
          </div>
          <Skeleton className="w-3/4 h-5 rounded-md" />
          <Skeleton className="w-full h-4 rounded-md" />
          <Skeleton className="w-2/3 h-4 rounded-md" />
        </div>
      ))}
    </div>
  );
};

// 9. Pricing / Package List Skeleton
export const PricingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <Skeleton className="w-20 h-5 rounded-md" />
            <Skeleton className="w-32 h-6 rounded-md" />
            <Skeleton className="w-24 h-8 rounded-md" />
            <div className="space-y-2 pt-2">
              <Skeleton className="w-full h-4 rounded-md" />
              <Skeleton className="w-5/6 h-4 rounded-md" />
              <Skeleton className="w-4/6 h-4 rounded-md" />
            </div>
          </div>
          <Skeleton className="w-full h-10 rounded-xl" />
        </div>
      ))}
    </div>
  );
};

// 10. MCQ Practice Page Skeleton
export const MCQPracticeSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Col Papers */}
      <div className="space-y-3">
        <Skeleton className="w-36 h-5 rounded-md" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-20 rounded-xl" />
        ))}
      </div>
      {/* Right Col Selected Launchpad */}
      <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
        <Skeleton className="w-28 h-4 rounded-md" />
        <Skeleton className="w-3/4 h-8 rounded-md" />
        <Skeleton className="w-full h-16 rounded-xl" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
        <Skeleton className="w-48 h-10 rounded-xl" />
      </div>
    </div>
  );
};

// 11. Search Results Skeleton
export const SearchResultsSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Filter Tabs Skeleton */}
      <div className="flex gap-2">
        <Skeleton className="w-20 h-8 rounded-lg" />
        <Skeleton className="w-24 h-8 rounded-lg" />
        <Skeleton className="w-24 h-8 rounded-lg" />
        <Skeleton className="w-24 h-8 rounded-lg" />
      </div>

      {/* Results Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
          >
            <div className="flex justify-between">
              <Skeleton className="w-20 h-4 rounded-md" />
              <Skeleton className="w-16 h-4 rounded-md" />
            </div>
            <Skeleton className="w-full h-5 rounded-md" />
            <Skeleton className="w-4/5 h-4 rounded-md" />
            <div className="pt-2 flex justify-between">
              <Skeleton className="w-24 h-4 rounded-md" />
              <Skeleton className="w-20 h-4 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

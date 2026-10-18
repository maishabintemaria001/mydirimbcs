import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TopPerformersSection } from '../components/TopPerformersSection.js';
import { SkillsHeatmap } from '../components/SkillsHeatmap.js';
import { AdSlot } from '../components/AdSlot.js';
import { Trophy, Brain, BarChart2 } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'skills_heatmap'>('leaderboard');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link to="/" className="hover:text-slate-800">হোম</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">মেধা তালিকা ও দক্ষতা অ্যানালাইসিস</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            জাতীয় মেধা তালিকা ও স্কিলস হিটম্যাপ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            মডেল টেস্টে অংশগ্রহণকারী শিক্ষার্থীদের জাতীয় র‍্যাঙ্কিং, স্কোর ট্রেন্ড এবং বিষয়ভিত্তিক দক্ষতা ম্যাট্রিক্স
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>টপ পারফরমার্স ও মেধা তালিকা</span>
          </button>
          <button
            onClick={() => setActiveTab('skills_heatmap')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'skills_heatmap'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-indigo-600" />
            <span>স্কিলস হিটম্যাপ (Skills Matrix)</span>
          </button>
        </div>
      </div>

      {/* Conditional View */}
      {activeTab === 'leaderboard' ? (
        <TopPerformersSection />
      ) : (
        <SkillsHeatmap />
      )}

      {/* Dynamic Ad Placement */}
      <AdSlot placement="footer" />
    </div>
  );
};

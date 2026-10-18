import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ApiClient } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { 
  Sparkles, 
  Brain, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight,
  HelpCircle,
  Award,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeatmapCell {
  session_id: string;
  session_title: string;
  session_title_bn: string;
  session_date: string;
  accuracy: number;
  total_questions: number;
  correct_count: number;
  proficiency_level: string;
}

interface HeatmapSubject {
  id: string;
  name: string;
  name_bn: string;
  overall_proficiency: number;
  tier: string;
  recommendation: string;
  recommendation_bn: string;
  cells: HeatmapCell[];
}

interface HeatmapData {
  user: { id: string; name: string };
  sessions: { id: string; title: string; title_bn: string; date: string }[];
  subjects: HeatmapSubject[];
  overall_average: number;
  strongest_subject: { id: string; name: string; score: number } | null;
  weakest_subject: { id: string; name: string; score: number } | null;
}

export const SkillsHeatmap: React.FC<{ candidateId?: string }> = ({ candidateId }) => {
  const { user } = useAuth();
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{
    subject: HeatmapSubject;
    cell: HeatmapCell;
    x: number;
    y: number;
  } | null>(null);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoading(true);
    const targetId = candidateId || (user ? user.id : 'usr_rahim');
    ApiClient.getSkillsHeatmap(targetId)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load skills heatmap', err);
        setLoading(false);
      });
  }, [candidateId, user]);

  // Render D3 Heatmap Matrix
  useEffect(() => {
    if (!data || !svgRef.current || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 840;
    const height = 380;
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const margin = { top: 60, right: 30, bottom: 20, left: 210 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: Mock Exam Sessions
    const sessionIds = data.sessions.map(s => s.id);
    const xScale = d3.scaleBand()
      .domain(sessionIds)
      .range([0, innerWidth])
      .padding(0.12);

    // Y Scale: Subjects
    const subjectIds = data.subjects.map(s => s.id);
    const yScale = d3.scaleBand()
      .domain(subjectIds)
      .range([0, innerHeight])
      .padding(0.14);

    // Color Scale for accuracy: Red/Amber (<50%) -> Amber (50-69%) -> Cyan/Sky (70-84%) -> Emerald (>=85%)
    const getColor = (acc: number) => {
      if (acc >= 90) return '#059669'; // Emerald 600
      if (acc >= 80) return '#10b981'; // Emerald 500
      if (acc >= 70) return '#0ea5e9'; // Sky 500
      if (acc >= 55) return '#f59e0b'; // Amber 500
      return '#f43f5e'; // Rose 500
    };

    const getBgColor = (acc: number) => {
      if (acc >= 90) return '#ecfdf5';
      if (acc >= 80) return '#f0fdf4';
      if (acc >= 70) return '#f0f9ff';
      if (acc >= 55) return '#fffbeb';
      return '#fff1f2';
    };

    // Render Matrix Cells
    data.subjects.forEach(subject => {
      subject.cells.forEach(cell => {
        const x = xScale(cell.session_id) || 0;
        const y = yScale(subject.id) || 0;
        const w = xScale.bandwidth();
        const h = yScale.bandwidth();

        const cellGroup = g.append('g')
          .attr('class', 'heatmap-cell')
          .style('cursor', 'pointer')
          .on('mouseenter', (event) => {
            const rect = containerRef.current?.getBoundingClientRect();
            const mouseX = event.clientX - (rect?.left || 0);
            const mouseY = event.clientY - (rect?.top || 0);
            setHoveredCell({ subject, cell, x: mouseX, y: mouseY });
          })
          .on('mouseleave', () => setHoveredCell(null))
          .on('click', () => setSelectedSubjectId(subject.id));

        // Cell background tile
        cellGroup.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', w)
          .attr('height', h)
          .attr('rx', 8)
          .attr('fill', getBgColor(cell.accuracy))
          .attr('stroke', getColor(cell.accuracy))
          .attr('stroke-width', 1.5)
          .attr('opacity', 0)
          .transition()
          .duration(600)
          .attr('opacity', 0.95);

        // Accuracy % Label inside cell
        cellGroup.append('text')
          .attr('x', x + w / 2)
          .attr('y', y + h / 2 - 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', '700')
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('fill', getColor(cell.accuracy))
          .text(`${cell.accuracy}%`);

        // Small indicator text: correct / total
        cellGroup.append('text')
          .attr('x', x + w / 2)
          .attr('y', y + h / 2 + 13)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '9.5px')
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('fill', '#64748b')
          .text(`${cell.correct_count}/${cell.total_questions}`);
      });
    });

    // Top X Axis (Exam Session Names)
    const topAxisG = g.append('g').attr('transform', `translate(0, -10)`);
    data.sessions.forEach((sess, idx) => {
      const x = (xScale(sess.id) || 0) + xScale.bandwidth() / 2;
      const textGroup = topAxisG.append('g').attr('transform', `translate(${x}, 0)`);

      textGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', -24)
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('fill', '#1e293b')
        .text(`টেস্ট ০${idx + 1}`);

      textGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', -10)
        .attr('font-size', '9.5px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('fill', '#94a3b8')
        .text(sess.date.replace('2026-', ''));
    });

    // Left Y Axis (Subject Names in Bengali & English)
    const leftAxisG = g.append('g');
    data.subjects.forEach(sub => {
      const y = (yScale(sub.id) || 0) + yScale.bandwidth() / 2;
      const textGroup = leftAxisG.append('g').attr('transform', `translate(-14, ${y})`);

      textGroup.append('text')
        .attr('text-anchor', 'end')
        .attr('y', -3)
        .attr('font-size', '12px')
        .attr('font-weight', '700')
        .attr('fill', '#0f172a')
        .text(sub.name_bn);

      textGroup.append('text')
        .attr('text-anchor', 'end')
        .attr('y', 11)
        .attr('font-size', '10px')
        .attr('fill', '#64748b')
        .text(sub.name.length > 25 ? sub.name.slice(0, 23) + '…' : sub.name);
    });

    // Legend at bottom
    const legendG = svg.append('g').attr('transform', `translate(${margin.left}, ${height - 5})`);
    const legendItems = [
      { label: '< 55% Needs Focus', color: '#f43f5e' },
      { label: '55-69% Developing', color: '#f59e0b' },
      { label: '70-84% Proficient', color: '#0ea5e9' },
      { label: '≥ 85% Mastery', color: '#059669' },
    ];

    legendItems.forEach((item, i) => {
      const legX = i * 140;
      legendG.append('circle')
        .attr('cx', legX)
        .attr('cy', 0)
        .attr('r', 4.5)
        .attr('fill', item.color);

      legendG.append('text')
        .attr('x', legX + 8)
        .attr('y', 3.5)
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('fill', '#475569')
        .text(item.label);
    });
  }, [data, loading]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-3 shadow-xs">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs">স্কিলস হিটম্যাপ অ্যানালাইসিস লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!data) return null;

  const selectedSubject = selectedSubjectId 
    ? data.subjects.find(s => s.id === selectedSubjectId)
    : data.subjects[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8" ref={containerRef}>
      {/* Title & Diagnostic Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Brain className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              Diagnostic Skills Heatmap
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            বিষয়ভিত্তিক দক্ষতা হিটম্যাপ (Skills Matrix)
          </h2>
          <p className="text-xs text-slate-500">
            বিগত মডেল টেস্টগুলোর ফলাফলের ভিত্তিতে আপনার শক্তিশালী ও দুর্বল বিষয়সমূহের রিয়েল-টাইম হিটম্যাপ
          </p>
        </div>

        {/* Candidate Identifier */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">বিশ্লেষিত শিক্ষার্থী</span>
            <span className="font-bold text-slate-800">{data.user.name}</span>
          </div>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Index */}
        <div className="p-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 to-white space-y-1">
          <div className="flex items-center justify-between text-xs text-indigo-900 font-semibold">
            <span>সামগ্রিক দক্ষতা সূচক</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-indigo-600 font-mono-numbers">
            {data.overall_average}%
          </p>
          <p className="text-[11px] text-slate-500">৬টি প্রধান বিষয়ের গড় নির্ভুলতা</p>
        </div>

        {/* Strongest Subject */}
        <div className="p-4 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/40 to-white space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold">
            <span>শীর্ষ শক্তিশালী বিষয়</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 leading-tight truncate">
            {data.strongest_subject?.name || 'গণিত ও মানসিক দক্ষতা'}
          </p>
          <p className="text-xs text-emerald-700 font-bold font-mono-numbers">
            {data.strongest_subject?.score}% দক্ষতা · Mastery Tier
          </p>
        </div>

        {/* Weakest Subject */}
        <div className="p-4 rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50/40 to-white space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-900 font-semibold">
            <span>উন্নতির বিশেষ জায়গা</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 leading-tight truncate">
            {data.weakest_subject?.name || 'আন্তর্জাতিক বিষয়াবলী'}
          </p>
          <p className="text-xs text-rose-700 font-bold font-mono-numbers">
            {data.weakest_subject?.score}% দক্ষতা · Needs Focus
          </p>
        </div>
      </div>

      {/* D3 Heatmap Canvas */}
      <div className="relative bg-slate-50/80 rounded-2xl border border-slate-200 p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            মডেল টেস্ট সেশন অনুযায়ী বিষয়ের নির্ভুলতার ম্যাট্রিক্স (Heatmap Matrix)
          </span>
          <span className="text-[11px]">প্রতিটি সেলে হোভার বা ক্লিক করে বিশদ তথ্য দেখুন</span>
        </div>

        <div className="w-full overflow-x-auto pb-4">
          <svg ref={svgRef} className="w-full h-auto min-w-[760px]"></svg>
        </div>

        {/* Floating Tooltip */}
        {hoveredCell && (
          <div 
            className="absolute z-30 bg-slate-950 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs space-y-1.5 pointer-events-none max-w-xs animate-fade-in"
            style={{
              left: Math.min(hoveredCell.x + 15, 520),
              top: Math.max(hoveredCell.y - 70, 20),
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
              <span className="font-bold text-white">{hoveredCell.subject.name_bn}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono-numbers ${
                hoveredCell.cell.accuracy >= 85 ? 'bg-emerald-950 text-emerald-400' :
                hoveredCell.cell.accuracy >= 70 ? 'bg-sky-950 text-sky-400' :
                hoveredCell.cell.accuracy >= 55 ? 'bg-amber-950 text-amber-400' : 'bg-rose-950 text-rose-400'
              }`}>
                {hoveredCell.cell.accuracy}%
              </span>
            </div>
            <p className="text-slate-300 font-mono-numbers text-[11px]">
              সেশন: {hoveredCell.cell.session_title_bn} ({hoveredCell.cell.session_date})
            </p>
            <p className="text-slate-300 font-mono-numbers text-[11px]">
              সঠিক উত্তর: <strong className="text-emerald-400">{hoveredCell.cell.correct_count}</strong> / {hoveredCell.cell.total_questions} টি
            </p>
            <p className="text-slate-400 text-[10.5px] pt-1 border-t border-slate-800/80">
              {hoveredCell.subject.recommendation_bn}
            </p>
          </div>
        )}
      </div>

      {/* Focus Area & Recommendations Drill-Down */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          বিষয়ভিত্তিক পারদর্শিতা ও পরীক্ষার টিপস (Actionable Insights)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.subjects.map(sub => {
            const isSelected = selectedSubject?.id === sub.id;

            return (
              <div
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`p-4 rounded-xl border text-xs space-y-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{sub.name_bn}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    sub.overall_proficiency >= 85 ? 'bg-emerald-100 text-emerald-800' :
                    sub.overall_proficiency >= 70 ? 'bg-sky-100 text-sky-800' :
                    sub.overall_proficiency >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {sub.tier}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>গড় পারদর্শিতা</span>
                    <span className="font-bold text-slate-800 font-mono-numbers">{sub.overall_proficiency}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        sub.overall_proficiency >= 85 ? 'bg-emerald-500' :
                        sub.overall_proficiency >= 70 ? 'bg-sky-500' :
                        sub.overall_proficiency >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${sub.overall_proficiency}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                  {sub.recommendation_bn}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-indigo-600 font-semibold text-[11px]">
                  <span>এমসিকিউ সলভ করুন</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Subject Action Box */}
      {selectedSubject && (
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              Selected Subject Practice
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              {selectedSubject.name_bn} ({selectedSubject.name})
            </h4>
            <p className="text-xs text-slate-600">
              {selectedSubject.recommendation_bn}
            </p>
          </div>
          <Link
            to="/mcq-practice"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shadow-xs flex items-center gap-1.5"
          >
            <span>এই বিষয়ের প্রশ্ন প্র্যাকটিস করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};

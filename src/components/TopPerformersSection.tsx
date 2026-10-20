import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ApiClient } from '../services/api.js';
import { 
  Trophy, 
  TrendingUp, 
  BarChart2, 
  Award, 
  Flame, 
  ChevronRight, 
  CheckCircle2,
  Users,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LeaderboardSkeleton } from './Skeleton.js';

interface Performer {
  user_id: string;
  user_name: string;
  tests_count: number;
  total_score: number;
  highest_score: number;
  avg_score: number;
  accuracy: number;
  rank: number;
  badge: string;
  scores_history: { date: string; score: number; exam_title: string }[];
}

interface TrendPoint {
  date: string;
  display_date: string;
  avg_score: number;
  max_score: number;
  median_score: number;
  attempts_count: number;
}

interface DistributionBin {
  label: string;
  count: number;
  range: [number, number];
}

export const TopPerformersSection: React.FC = () => {
  const [data, setData] = useState<{
    performers: Performer[];
    trends: TrendPoint[];
    distribution: DistributionBin[];
    total_participants: number;
    total_attempts: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeView, setActiveView] = useState<'ranking' | 'trends' | 'distribution'>('ranking');
  const [hoveredData, setHoveredData] = useState<any>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch top performers data
  useEffect(() => {
    setLoading(true);
    ApiClient.getTopPerformers({ category_id: selectedCategory })
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load top performers', err);
        setLoading(false);
      });
  }, [selectedCategory]);

  // Render D3 Visualizations
  useEffect(() => {
    if (!data || !svgRef.current || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = 800;
    const height = 360;
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    if (activeView === 'ranking') {
      renderRankingsBarChart(svg, data.performers.slice(0, 7), width, height);
    } else if (activeView === 'trends') {
      renderScoreTrendsChart(svg, data.trends, width, height);
    } else if (activeView === 'distribution') {
      renderDistributionChart(svg, data.distribution, width, height);
    }
  }, [data, activeView, loading]);

  // D3 Chart 1: Top Candidate Rankings Bar Chart
  const renderRankingsBarChart = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    performers: Performer[],
    width: number,
    height: number
  ) => {
    const margin = { top: 30, right: 60, bottom: 40, left: 180 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: Highest Score
    const maxScore = d3.max(performers, d => d.highest_score) || 5;
    const xScale = d3.scaleLinear()
      .domain([0, maxScore * 1.1])
      .range([0, innerWidth]);

    // Y Scale: Candidate Names
    const yScale = d3.scaleBand()
      .domain(performers.map(d => d.user_name))
      .range([0, innerHeight])
      .padding(0.28);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisBottom(xScale).ticks(5).tickSize(innerHeight).tickFormat(() => ''));

    // Color gradient for bars
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient')
      .attr('id', 'rankBarGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#4f46e5');
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#06b6d4');

    // Bars
    g.selectAll('.bar')
      .data(performers)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => yScale(d.user_name) || 0)
      .attr('height', yScale.bandwidth())
      .attr('x', 0)
      .attr('rx', 6)
      .attr('fill', (d, i) => i === 0 ? 'url(#rankBarGrad)' : i === 1 ? '#6366f1' : '#3b82f6')
      .attr('width', 0)
      .transition()
      .duration(750)
      .attr('width', d => xScale(d.highest_score));

    // Interactive Hover Area
    g.selectAll('.bar-hover')
      .data(performers)
      .enter()
      .append('rect')
      .attr('y', d => yScale(d.user_name) || 0)
      .attr('height', yScale.bandwidth())
      .attr('x', 0)
      .attr('width', innerWidth)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('mouseenter', (_event, d) => setHoveredData(d))
      .on('mouseleave', () => setHoveredData(null));

    // Score Value Labels at the end of bars
    g.selectAll('.label-score')
      .data(performers)
      .enter()
      .append('text')
      .attr('class', 'label-score')
      .attr('x', d => xScale(d.highest_score) + 8)
      .attr('y', d => (yScale(d.user_name) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('fill', '#1e293b')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text(d => `${d.highest_score.toFixed(1)} pts (${d.accuracy}%)`);

    // Y Axis (Candidate names with ranks)
    const yAxis = d3.axisLeft(yScale)
      .tickSize(0)
      .tickFormat((d, i) => `#${i + 1} ${d.length > 22 ? d.slice(0, 20) + '…' : d}`);

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#334155')
      .attr('font-size', '11.5px')
      .attr('font-weight', '600')
      .attr('dx', -8);

    g.select('.domain').remove();
  };

  // D3 Chart 2: Exam Score Trends Line & Area Chart
  const renderScoreTrendsChart = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    trends: TrendPoint[],
    width: number,
    height: number
  ) => {
    if (trends.length === 0) return;

    const margin = { top: 30, right: 40, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: Dates
    const xScale = d3.scalePoint()
      .domain(trends.map(d => d.display_date))
      .range([0, innerWidth])
      .padding(0.4);

    // Y Scale: Scores
    const maxScore = d3.max(trends, d => Math.max(d.max_score, d.avg_score)) || 5;
    const yScale = d3.scaleLinear()
      .domain([0, Math.ceil(maxScore) + 0.5])
      .range([innerHeight, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth).tickFormat(() => ''));

    // Area generator for top score envelope
    const areaGen = d3.area<TrendPoint>()
      .x(d => xScale(d.display_date) || 0)
      .y0(innerHeight)
      .y1(d => yScale(d.max_score))
      .curve(d3.curveMonotoneX);

    // Gradient for area fill
    const defs = svg.append('defs');
    const areaGrad = defs.append('linearGradient')
      .attr('id', 'trendAreaGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    areaGrad.append('stop').attr('offset', '0%').attr('stop-color', '#4f46e5').attr('stop-opacity', 0.25);
    areaGrad.append('stop').attr('offset', '100%').attr('stop-color', '#4f46e5').attr('stop-opacity', 0.0);

    g.append('path')
      .datum(trends)
      .attr('fill', 'url(#trendAreaGrad)')
      .attr('d', areaGen);

    // Line 1: Top Candidate Score Line
    const topLine = d3.line<TrendPoint>()
      .x(d => xScale(d.display_date) || 0)
      .y(d => yScale(d.max_score))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(trends)
      .attr('fill', 'none')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2.5)
      .attr('d', topLine);

    // Line 2: Average Score Line
    const avgLine = d3.line<TrendPoint>()
      .x(d => xScale(d.display_date) || 0)
      .y(d => yScale(d.avg_score))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(trends)
      .attr('fill', 'none')
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4 4')
      .attr('d', avgLine);

    // Data dots with hover target
    g.selectAll('.dot-top')
      .data(trends)
      .enter()
      .append('circle')
      .attr('class', 'dot-top')
      .attr('cx', d => xScale(d.display_date) || 0)
      .attr('cy', d => yScale(d.max_score))
      .attr('r', 5)
      .attr('fill', '#ffffff')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', (_event, d) => setHoveredData({ type: 'trend', ...d }))
      .on('mouseleave', () => setHoveredData(null));

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '11px')
      .attr('font-family', 'JetBrains Mono, monospace');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '11px')
      .attr('font-family', 'JetBrains Mono, monospace');

    g.select('.domain').remove();
  };

  // D3 Chart 3: Cohort Score Distribution Histogram
  const renderDistributionChart = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    bins: DistributionBin[],
    width: number,
    height: number
  ) => {
    const margin = { top: 30, right: 40, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(bins.map(b => b.label))
      .range([0, innerWidth])
      .padding(0.3);

    const maxCount = d3.max(bins, b => b.count) || 5;
    const yScale = d3.scaleLinear()
      .domain([0, maxCount * 1.25])
      .range([innerHeight, 0]);

    // Bars
    g.selectAll('.dist-bar')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.label) || 0)
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.count))
      .attr('fill', (_d, i) => i >= 3 ? '#10b981' : '#6366f1')
      .attr('rx', 6)
      .style('cursor', 'pointer')
      .on('mouseenter', (_event, d) => setHoveredData({ type: 'dist', ...d }))
      .on('mouseleave', () => setHoveredData(null));

    // Value Labels on top of bars
    g.selectAll('.dist-label')
      .data(bins)
      .enter()
      .append('text')
      .attr('x', d => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.count) - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', '#1e293b')
      .text(d => `${d.count} জন`);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('fill', '#475569')
      .attr('font-size', '11px')
      .attr('font-weight', '600');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(4))
      .selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '10px');

    g.select('.domain').remove();
  };

  if (loading || !data) {
    return <LeaderboardSkeleton />;
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Trophy className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              National Leaderboard & Analytics
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            টপ পারফরমার্স ও পরীক্ষার স্কোর ট্রেন্ড
          </h2>
          <p className="text-xs text-slate-500">
            সারা দেশের মেধা তালিকা, গড় স্কোর উন্নয়ন গ্রাফ এবং পরীক্ষার্থীদের নম্বর বিন্যাস
          </p>
        </div>

        {/* View Segmented Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">সকল মডেল টেস্ট</option>
            <option value="cat_bcs">বিসিএস স্পেশাল (BCS)</option>
            <option value="cat_bank">ব্যাংকিং জবস (Bank)</option>
            <option value="cat_primary">প্রাথমিক শিক্ষক (Primary)</option>
          </select>

          {/* Interactive D3 Chart View Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveView('ranking')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeView === 'ranking' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              মেধা তালিকা বার
            </button>
            <button
              onClick={() => setActiveView('trends')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeView === 'trends' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              স্কোর ট্রেন্ড লাইন
            </button>
            <button
              onClick={() => setActiveView('distribution')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeView === 'distribution' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              নম্বর বিন্যাস
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.performers.slice(0, 3).map((performer, idx) => (
          <div
            key={performer.user_id}
            className={`p-4 rounded-xl border relative transition-all ${
              idx === 0
                ? 'bg-gradient-to-br from-amber-50/60 to-white border-amber-300 shadow-xs'
                : idx === 1
                ? 'bg-gradient-to-br from-slate-50 to-white border-slate-300'
                : 'bg-gradient-to-br from-orange-50/40 to-white border-orange-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                idx === 0 ? 'bg-amber-100 text-amber-900' : idx === 1 ? 'bg-slate-200 text-slate-800' : 'bg-orange-100 text-orange-900'
              }`}>
                {idx === 0 ? '🥇 ১ম স্থান (National 1st)' : idx === 1 ? '🥈 ২য় স্থান' : '🥉 ৩য় স্থান'}
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {performer.accuracy}% সঠিকতা
              </span>
            </div>

            <p className="font-bold text-slate-900 text-sm leading-snug truncate">
              {performer.user_name}
            </p>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                পরীক্ষা: <strong className="text-slate-800 font-mono-numbers">{performer.tests_count}</strong> টি
              </span>
              <span className="font-bold text-indigo-700 font-mono-numbers text-sm">
                {performer.highest_score.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">pts</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* D3 Interactive Visual Canvas */}
      <div className="relative bg-slate-50/80 rounded-2xl border border-slate-200 p-4" ref={containerRef}>
        <div className="flex items-center justify-between mb-2 px-2 text-xs text-slate-500">
          <span className="font-medium">
            {activeView === 'ranking' && '🎯 শীর্ষ শিক্ষার্থীদের সর্বোচ্চ নম্বর ও নির্ভুলতার হার'}
            {activeView === 'trends' && '📈 দিনভিত্তিক সর্বোচ্চ স্কোর ও জাতীয় গড় স্কোরের পরিবর্তন'}
            {activeView === 'distribution' && '📊 মোট পরীক্ষার্থীদের প্রাপ্ত নম্বরের ব্যাপ্তির হার'}
          </span>
          {activeView === 'trends' && (
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 font-medium text-indigo-700">
                <span className="w-3 h-0.5 bg-indigo-600 inline-block"></span> শীর্ষ স্কোর
              </span>
              <span className="flex items-center gap-1.5 font-medium text-cyan-700">
                <span className="w-3 h-0.5 border-t border-dashed border-cyan-600 inline-block"></span> জাতীয় গড়
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-24 text-center text-slate-400 space-y-2">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">D3 চার্ট প্রস্তুত হচ্ছে...</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg ref={svgRef} className="w-full h-auto min-w-[650px]"></svg>
          </div>
        )}

        {/* Hover Tooltip Overlay */}
        {hoveredData && (
          <div className="absolute top-4 right-4 bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl space-y-1 animate-fade-in pointer-events-none max-w-xs border border-slate-700">
            {hoveredData.user_name ? (
              <>
                <p className="font-bold text-amber-300">{hoveredData.user_name}</p>
                <p className="text-slate-300 font-mono-numbers">সর্বোচ্চ স্কোর: {hoveredData.highest_score} নম্বর</p>
                <p className="text-slate-300 font-mono-numbers">নির্ভুলতার হার: {hoveredData.accuracy}%</p>
                <p className="text-slate-400 font-mono-numbers text-[10px]">মোট পরীক্ষা: {hoveredData.tests_count} টি</p>
              </>
            ) : hoveredData.type === 'trend' ? (
              <>
                <p className="font-bold text-indigo-300 font-mono-numbers">তারিখ: {hoveredData.date}</p>
                <p className="text-slate-200 font-mono-numbers">দিনটির শীর্ষ স্কোর: {hoveredData.max_score}</p>
                <p className="text-slate-300 font-mono-numbers">জাতীয় গড় স্কোর: {hoveredData.avg_score}</p>
                <p className="text-slate-400 font-mono-numbers text-[10px]">অংশগ্রহণকারী: {hoveredData.attempts_count} জন</p>
              </>
            ) : (
              <>
                <p className="font-bold text-emerald-300">নম্বর ব্র্যাকেট: {hoveredData.label}</p>
                <p className="text-slate-200 font-mono-numbers">মোট পরীক্ষার্থী: {hoveredData.count} জন</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Top 10 National Merit Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">জাতীয় পূর্ণাঙ্গ মেধা তালিকা (Top 10 Merit List)</h3>
          <span className="text-xs text-slate-500 font-mono-numbers">
            সর্বমোট অংশগ্রহণকারী: {data?.total_participants || 0} জন
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">মেধা ক্রম</th>
                <th className="py-2.5 px-3">পরীক্ষার্থীর নাম ও প্রতিষ্ঠান</th>
                <th className="py-2.5 px-3">অংশগ্রহণ</th>
                <th className="py-2.5 px-3">সর্বোচ্চ নম্বর</th>
                <th className="py-2.5 px-3">গড় নম্বর</th>
                <th className="py-2.5 px-3">সঠিকতার হার</th>
                <th className="py-2.5 px-3 text-right">পদক</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.performers.slice(0, 8).map((p) => (
                <tr key={p.user_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono-numbers font-bold text-slate-800">
                    #{p.rank}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {p.user_name}
                  </td>
                  <td className="py-3 px-3 font-mono-numbers text-slate-600">
                    {p.tests_count} টি
                  </td>
                  <td className="py-3 px-3 font-mono-numbers font-bold text-indigo-700">
                    {p.highest_score.toFixed(1)}
                  </td>
                  <td className="py-3 px-3 font-mono-numbers text-slate-700">
                    {p.avg_score.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 font-mono-numbers text-emerald-700 font-semibold">
                    {p.accuracy}%
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.rank === 1 ? 'bg-amber-100 text-amber-900' : p.rank === 2 ? 'bg-slate-200 text-slate-800' : p.rank === 3 ? 'bg-orange-100 text-orange-900' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Competitive CTA banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>নিজের মেধা যাচাই করুন এবং জাতীয় র‍্যাঙ্কিংয়ে প্রবেশ করুন</span>
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            সদ্য প্রকাশিত মডেল টেস্টগুলোতে অংশ নিয়ে আপনার প্রস্তুতি এবং অবস্থান নিশ্চিত করুন।
          </p>
        </div>
        <Link
          to="/exams"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shadow-sm"
        >
          মডেল টেস্ট দিন →
        </Link>
      </div>
    </section>
  );
};

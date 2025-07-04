import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const trendOptions = [
  { key: 'impressions', label: 'Impressions', color: '#a78bfa' },
  { key: 'clicks', label: 'Clicks', color: '#2563eb' },
  { key: 'spend', label: 'Spend', color: '#f472b6' },
];

export default function AnalyticsPanels({ analytics }) {
  const [trend, setTrend] = useState('impressions');
  const [carouselIdx, setCarouselIdx] = useState(0);

  // Trend chart data
  const trendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: trendOptions.find(t => t.key === trend).label,
        data: [120, 140, 130, 160, 180, 170, 200], // Replace with real data if available
        borderColor: trendOptions.find(t => t.key === trend).color,
        backgroundColor: trendOptions.find(t => t.key === trend).color + '22',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  // Platform breakdown data
  const platformLabels = analytics?.platform_breakdown?.map(p => p.platform) || [];
  const platformData = {
    labels: platformLabels,
    datasets: [
      {
        label: 'Impressions',
        data: analytics?.platform_breakdown?.map(p => p.impressions) || [],
        backgroundColor: ['#a78bfa', '#2563eb', '#f472b6', '#10b981'],
        borderRadius: 8,
      },
    ],
  };

  // Top-performing content carousel
  const topContent = analytics?.top_performing_content?.slice(0, 5) || [];

  return (
    <div className="w-full flex flex-col gap-8 mt-2">
      {/* Trend Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-900">Trends</h3>
          <div className="flex gap-2">
            {trendOptions.map(opt => (
              <button
                key={opt.key}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition border ${trend === opt.key ? 'bg-purple-100 border-purple-400 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                onClick={() => setTrend(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="w-full h-48 md:h-56">
          <Line data={trendData} options={{
            plugins: { legend: { display: false } },
            scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' }, beginAtZero: true } },
            responsive: true,
            maintainAspectRatio: false,
          }} height={180} />
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4">Platform Breakdown</h3>
        <div className="w-full h-40">
          <Bar data={platformData} options={{
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: { x: { grid: { color: '#f1f5f9' }, beginAtZero: true }, y: { grid: { display: false } } },
            responsive: true,
            maintainAspectRatio: false,
            barThickness: 24,
          }} height={120} />
        </div>
      </div>

      {/* Top Performing Content Carousel */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-900">Top Performing Content</h3>
          <div className="flex gap-2">
            <button onClick={() => setCarouselIdx(i => Math.max(0, i - 1))} disabled={carouselIdx === 0} className="p-2 rounded-full bg-gray-100 hover:bg-purple-100 transition disabled:opacity-50"><ChevronLeft /></button>
            <button onClick={() => setCarouselIdx(i => Math.min(topContent.length - 1, i + 1))} disabled={carouselIdx === topContent.length - 1} className="p-2 rounded-full bg-gray-100 hover:bg-purple-100 transition disabled:opacity-50"><ChevronRight /></button>
          </div>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="flex transition-transform duration-300" style={{ transform: `translateX(-${carouselIdx * 220}px)` }}>
            {topContent.map((content, idx) => (
              <motion.div
                key={content.asset_id}
                className="min-w-[200px] max-w-[220px] mr-4 bg-gray-50 rounded-xl shadow-md overflow-hidden relative group"
                whileHover={{ scale: 1.04, boxShadow: '0 4px 24px #a78bfa22' }}
              >
                {content.image_url ? (
                  <img src={content.image_url} alt="Content preview" className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 bg-gray-200 flex items-center justify-center text-3xl">?</div>
                )}
                <div className="p-3">
                  <div className="text-xs text-gray-500 mb-1">{content.platform}</div>
                  <div className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{content.content_preview}</div>
                  <div className="flex gap-2 text-xs text-gray-700">
                    <span>Impr: {content.impressions}</span>
                    <span>Eng: {content.engagements}</span>
                    <span>Rate: {content.engagement_rate}%</span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full shadow">{idx + 1}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
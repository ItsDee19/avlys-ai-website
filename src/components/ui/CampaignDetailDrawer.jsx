import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit, Pause, Copy, Play, Trash2, Eye, Users, MousePointerClick, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';

export default function CampaignDetailDrawer({ campaign, isOpen, onClose, onEdit, onDelete }) {
  if (!campaign) return null;

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toLocaleString() || '0';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  // Mock time-series data
  const timeSeriesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Impressions',
        data: [120, 140, 130, 160, 180, 170, 200],
        borderColor: '#a78bfa',
        backgroundColor: '#a78bfa22',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Clicks',
        data: [30, 40, 35, 50, 60, 55, 70],
        borderColor: '#2563eb',
        backgroundColor: '#2563eb22',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // Platform breakdown data
  const platformData = {
    labels: campaign.platforms || ['Facebook', 'Instagram', 'Google'],
    datasets: [{
      data: [40, 35, 25],
      backgroundColor: ['#a78bfa', '#2563eb', '#f472b6'],
      borderWidth: 0,
    }]
  };

  const kpiCards = [
    {
      label: 'Impressions',
      value: formatNumber(campaign.impressions),
      icon: <Eye className="w-5 h-5 text-purple-500" />,
      color: 'from-purple-100 to-purple-50'
    },
    {
      label: 'Clicks',
      value: formatNumber(campaign.clicks),
      icon: <MousePointerClick className="w-5 h-5 text-blue-500" />,
      color: 'from-blue-100 to-blue-50'
    },
    {
      label: 'CTR',
      value: campaign.impressions ? `${((campaign.clicks || 0) / campaign.impressions * 100).toFixed(2)}%` : '0%',
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      color: 'from-green-100 to-green-50'
    },
    {
      label: 'Spend',
      value: formatCurrency(campaign.spend),
      icon: <DollarSign className="w-5 h-5 text-pink-500" />,
      color: 'from-pink-100 to-pink-50'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{campaign.title || 'Untitled Campaign'}</h2>
                <p className="text-sm text-gray-500">Campaign Details</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4">
                {kpiCards.map((kpi, index) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-br ${kpi.color} rounded-xl p-4 shadow-sm`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {kpi.icon}
                      <span className="text-xs font-semibold text-gray-600">{kpi.label}</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">{kpi.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* Campaign Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Campaign Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Platforms:</span>
                    <span className="ml-2 text-gray-900">{campaign.platforms?.join(', ') || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2 text-gray-900">{formatDate(campaign.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Budget:</span>
                    <span className="ml-2 text-gray-900">{formatCurrency(campaign.budget)}</span>
                  </div>
                </div>
              </div>

              {/* Time Series Chart */}
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Performance Over Time</h3>
                <div className="h-48">
                  <Line
                    data={timeSeriesData}
                    options={{
                      plugins: { legend: { display: true, position: 'bottom' } },
                      scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' }, beginAtZero: true } },
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </div>

              {/* Platform Breakdown */}
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Platform Breakdown</h3>
                <div className="h-48">
                  <Doughnut
                    data={platformData}
                    options={{
                      plugins: { legend: { display: true, position: 'bottom' } },
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </div>

              {/* Creative Gallery */}
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Creative Assets</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">Asset {i}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => onEdit(campaign)}
                  className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-purple-600 transition flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Campaign
                </button>
                <button
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Pause className="w-4 h-4 text-gray-500" />
                  Pause
                </button>
                <button
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                  Duplicate
                </button>
                <button
                  onClick={() => onDelete(campaign.id)}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 
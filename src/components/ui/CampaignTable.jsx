import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MoreHorizontal, Eye, Edit, Trash2, Calendar, TrendingUp, Users, MousePointerClick, Play, Pause } from 'lucide-react';
import { updateCampaign, deleteUserCampaign } from '../../utils/firestoreUtils';

export default function CampaignTable({ campaigns, onViewDetails, onEdit, onDelete, onBulkAction, user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [campaignStatuses, setCampaignStatuses] = useState({});

  // Responsive check
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter and sort campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns.filter(campaign =>
      campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.title || '';
          bVal = b.title || '';
          break;
        case 'status':
          aVal = a.status || '';
          bVal = b.status || '';
          break;
        case 'impressions':
          aVal = a.impressions || 0;
          bVal = b.impressions || 0;
          break;
        case 'clicks':
          aVal = a.clicks || 0;
          bVal = b.clicks || 0;
          break;
        case 'engagement':
          aVal = (a.clicks || 0) / (a.impressions || 1) * 100;
          bVal = (b.clicks || 0) / (b.impressions || 1) * 100;
          break;
        default:
          aVal = a.title || '';
          bVal = b.title || '';
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [campaigns, searchTerm, sortBy, sortOrder]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedCampaigns.length === filteredAndSortedCampaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(filteredAndSortedCampaigns.map(c => c.id));
    }
  };

  const handleSelectCampaign = (campaignId) => {
    setSelectedCampaigns(prev =>
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toLocaleString() || '0';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const getCampaignStatus = (campaign) => {
    return campaignStatuses[campaign.id] || campaign.status;
  };

  const handlePlay = async (campaign) => {
    setCampaignStatuses((prev) => ({ ...prev, [campaign.id]: 'active' }));
    if (user && user.id) {
      try {
        await updateCampaign(campaign.id, { status: 'active' });
      } catch (e) { alert('Failed to activate campaign'); }
    }
  };

  const handlePause = async (campaign) => {
    setCampaignStatuses((prev) => ({ ...prev, [campaign.id]: 'paused' }));
    if (user && user.id) {
      try {
        await updateCampaign(campaign.id, { status: 'paused' });
      } catch (e) { alert('Failed to pause campaign'); }
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      if (user && user.id) {
        try {
          await deleteUserCampaign(user.id, campaignId);
          onDelete(campaignId);
        } catch (e) { alert('Failed to delete campaign'); }
      }
    }
  };

  if (isMobile) {
    // Mobile card view
    return (
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Campaign cards */}
        <AnimatePresence>
          {filteredAndSortedCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{campaign.title || 'Untitled Campaign'}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(campaign.status)}`}>
                      {getCampaignStatus(campaign) || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(campaign.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="relative flex gap-1">
                  {/* Play button: show if paused or draft */}
                  {(getCampaignStatus(campaign) === 'paused' || getCampaignStatus(campaign) === 'draft') && (
                    <button
                      onClick={() => handlePlay(campaign)}
                      className="text-green-600 hover:text-green-900 transition"
                      title="Activate (Play)"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  {/* Pause button: show if active */}
                  {getCampaignStatus(campaign) === 'active' && (
                    <button
                      onClick={() => handlePause(campaign)}
                      className="text-yellow-600 hover:text-yellow-900 transition"
                      title="Pause"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="text-red-600 hover:text-red-900 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(campaign)}
                    className="text-gray-600 hover:text-gray-900 transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{formatNumber(campaign.impressions)}</div>
                  <div className="text-xs text-gray-500">Impressions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{formatNumber(campaign.clicks)}</div>
                  <div className="text-xs text-gray-500">Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {campaign.impressions ? `${((campaign.clicks || 0) / campaign.impressions * 100).toFixed(2)}%` : '0%'}
                  </div>
                  <div className="text-xs text-gray-500">CTR</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onViewDetails(campaign)}
                  className="flex-1 bg-purple-500 text-white py-2 px-3 rounded-xl text-sm font-semibold hover:bg-purple-600 transition"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Table header with search and bulk actions */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          {selectedCampaigns.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{selectedCampaigns.length} selected</span>
              <button className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition">
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedCampaigns.length === filteredAndSortedCampaigns.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </th>
              {[
                { key: 'name', label: 'Campaign Name' },
                { key: 'status', label: 'Status' },
                { key: 'date', label: 'Date Range' },
                { key: 'impressions', label: 'Impressions' },
                { key: 'clicks', label: 'Clicks' },
                { key: 'engagement', label: 'Engagement Rate' },
                { key: 'actions', label: 'Actions' }
              ].map(column => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => column.key !== 'actions' && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {sortBy === column.key && (
                      <span className="text-purple-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            <AnimatePresence>
              {filteredAndSortedCampaigns.map((campaign, index) => (
                <motion.tr
                  key={campaign.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.includes(campaign.id)}
                      onChange={() => handleSelectCampaign(campaign.id)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {(campaign.title || 'C')[0].toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{campaign.title || 'Untitled Campaign'}</div>
                        <div className="text-sm text-gray-500">{campaign.platforms?.join(', ') || 'No platforms'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(campaign.status)}`}>
                      {campaign.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(campaign.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatNumber(campaign.impressions)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatNumber(campaign.clicks)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {campaign.impressions ? `${((campaign.clicks || 0) / campaign.impressions * 100).toFixed(2)}%` : '0%'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewDetails(campaign)}
                        className="text-purple-600 hover:text-purple-900 transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(campaign)}
                        className="text-gray-600 hover:text-gray-900 transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {/* Play button: show if paused or draft */}
                      {(getCampaignStatus(campaign) === 'paused' || getCampaignStatus(campaign) === 'draft') && (
                        <button
                          onClick={() => handlePlay(campaign)}
                          className="text-green-600 hover:text-green-900 transition"
                          title="Activate (Play)"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {/* Pause button: show if active */}
                      {getCampaignStatus(campaign) === 'active' && (
                        <button
                          onClick={() => handlePause(campaign)}
                          className="text-yellow-600 hover:text-yellow-900 transition"
                          title="Pause"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="text-red-600 hover:text-red-900 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
} 
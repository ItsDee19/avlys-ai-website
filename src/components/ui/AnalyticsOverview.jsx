import React from 'react';
import { Eye, Users, MousePointerClick, Heart, BarChart3, TrendingUp, Image, Video, FileText, Instagram, Facebook, Twitter } from 'lucide-react';

const AnalyticsOverview = ({ analytics, loading, error }) => {
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getAssetIcon = (assetType) => {
    switch (assetType.toLowerCase()) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'carousel': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading skeleton for metrics cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="w-24 h-8 bg-gray-200 rounded mb-2"></div>
              <div className="w-32 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        
        {/* Loading skeleton for platform breakdown */}
        <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl p-6">
          <div className="w-48 h-6 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 bg-gray-200 rounded"></div>
                  <div className="w-full h-2 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-600 font-semibold mb-2">Failed to load analytics</div>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <div className="text-gray-600 font-semibold">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overall Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-xl p-3">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Impressions</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(analytics.total_impressions)}</div>
          <div className="text-sm text-gray-500 mt-1">Total views</div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-xl p-3">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Reach</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(analytics.total_reach)}</div>
          <div className="text-sm text-gray-500 mt-1">Unique users</div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-xl p-3">
              <MousePointerClick className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Clicks</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(analytics.total_clicks)}</div>
          <div className="text-sm text-gray-500 mt-1">Total clicks</div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 rounded-xl p-3">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Engagement Rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{analytics.overall_engagement_rate.toFixed(2)}%</div>
          <div className="text-sm text-gray-500 mt-1">Overall rate</div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-500 rounded-xl p-2">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Platform Performance</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Platform</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Impressions</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Reach</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Clicks</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Engagements</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Engagement Rate</th>
              </tr>
            </thead>
            <tbody>
              {analytics.platform_breakdown.map((platform, index) => (
                <tr key={platform.platform} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(platform.platform)}
                      <span className="font-medium text-gray-900">{platform.platform}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-gray-700">{formatNumber(platform.impressions)}</td>
                  <td className="text-right py-3 px-4 text-gray-700">{formatNumber(platform.reach)}</td>
                  <td className="text-right py-3 px-4 text-gray-700">{formatNumber(platform.clicks)}</td>
                  <td className="text-right py-3 px-4 text-gray-700">{formatNumber(platform.engagements)}</td>
                  <td className="text-right py-3 px-4">
                    <span className="font-semibold text-green-600">{platform.engagement_rate.toFixed(2)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-500 rounded-xl p-2">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Top Performing Content</h3>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {analytics.top_performing_content.slice(0, 6).map((content) => (
            <div key={content.asset_id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0">
                  {content.image_url ? (
                    <img 
                      src={content.image_url} 
                      alt="Content preview" 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      {getAssetIcon(content.asset_type)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getPlatformIcon(content.platform)}
                    <span className="text-xs font-medium text-gray-500 uppercase">{content.platform}</span>
                  </div>
                  <p className="text-sm text-gray-900 line-clamp-2">
                    {content.content_preview.length > 100 
                      ? `${content.content_preview.substring(0, 100)}...` 
                      : content.content_preview}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{formatNumber(content.impressions)}</div>
                  <div className="text-gray-500">Impressions</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{formatNumber(content.engagements)}</div>
                  <div className="text-gray-500">Engagements</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{content.engagement_rate.toFixed(2)}%</div>
                  <div className="text-gray-500">Rate</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview; 
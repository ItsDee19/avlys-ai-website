import React from 'react';
import MetricCard from './MetricCard';
import AnalyticsOverview from './AnalyticsOverview';
import { BarChart2, Activity, Users, Target } from 'lucide-react';

export const TabsContentOverview = ({ 
  campaigns, 
  analytics, 
  analyticsLoading, 
  analyticsError 
}) => {
  // Calculate overview data
  const overviewData = React.useMemo(() => {
    if (!campaigns || campaigns.length === 0) {
      return {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalReach: 0,
        avgEngagement: 0
      };
    }

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(campaign => 
      campaign.status === 'active' || campaign.status === 'running'
    ).length;
    
    const totalReach = campaigns.reduce((sum, campaign) => 
      sum + (campaign.reach || 0), 0
    );
    
    const avgEngagement = campaigns.length > 0 
      ? campaigns.reduce((sum, campaign) => 
          sum + (campaign.engagementRate || 0), 0
        ) / campaigns.length
      : 0;

    return {
      totalCampaigns,
      activeCampaigns,
      totalReach,
      avgEngagement
    };
  }, [campaigns]);

  return (
    <div className="space-y-8">
      {/* Overview Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<BarChart2 />}
          label="Total Campaigns"
          value={overviewData.totalCampaigns}
          subtext="All campaigns"
          trend={{ direction: "up", value: "12%" }}
        />
        <MetricCard
          icon={<Activity />}
          label="Active Campaigns"
          value={overviewData.activeCampaigns}
          subtext="Currently running"
          trend={{ direction: "up", value: "8%" }}
        />
        <MetricCard
          icon={<Users />}
          label="Total Reach"
          value={overviewData.totalReach.toLocaleString()}
          subtext="Combined audience"
          trend={{ direction: "up", value: "15%" }}
        />
        <MetricCard
          icon={<Target />}
          label="Avg Engagement"
          value={`${overviewData.avgEngagement.toFixed(2)}%`}
          subtext="Across all campaigns"
          trend={{ direction: "up", value: "5%" }}
        />
      </div>

      {/* Analytics Overview */}
      <AnalyticsOverview 
        analytics={analytics}
        loading={analyticsLoading}
        error={analyticsError}
      />
    </div>
  );
}; 
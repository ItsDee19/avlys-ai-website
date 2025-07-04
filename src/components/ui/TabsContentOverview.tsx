import React from "react";
import MetricCard from "./MetricCard";
import {
  Target,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  BarChart3,
  Sparkles,
  Star,
  MapPin,
  Award,
  Filter,
  ArrowUp,
  Zap,
} from "lucide-react";

// Example props for dynamic data (replace with real data as needed)
interface OverviewData {
  totalCampaigns: number;
  campaignsTrend: string;
  campaignsBreakdown: { label: string; value: number; color: string }[];
  totalRevenue: string;
  revenueTrend: string;
  roi: string;
  roas: string;
  totalReach: string;
  reachTrend: string;
  impressions: string;
  ctr: string;
  avgConversion: string;
  conversionTrend: string;
  bestConversion: string;
  avgLead: string;
  performanceMetrics: { label: string; value: string; trend: string; icon: React.ReactNode }[];
  topCampaigns: { name: string; border: string; conversion: string; revenue: string; roi: string; status: string; color: string }[];
  regions: { name: string; revenue: string; campaigns: number; color: string }[];
  activities: { icon: React.ReactNode; color: string; title: string; desc: string; time: string; location: string }[];
}

const defaultData: OverviewData = {
  totalCampaigns: 24,
  campaignsTrend: "+8 this month",
  campaignsBreakdown: [
    { label: "Active", value: 18, color: "text-green-400" },
    { label: "Paused", value: 4, color: "text-blue-400" },
    { label: "Draft", value: 2, color: "text-orange-400" },
  ],
  totalRevenue: "₹8.5L",
  revenueTrend: "+22% vs last month",
  roi: "4.2x",
  roas: "380%",
  totalReach: "2.4M",
  reachTrend: "+45% growth",
  impressions: "12.8M",
  ctr: "3.2%",
  avgConversion: "4.8%",
  conversionTrend: "+1.2% improvement",
  bestConversion: "12.4%",
  avgLead: "₹245",
  performanceMetrics: [
    { label: "This Week", value: "15.2K", trend: "+12%", icon: <ArrowUp className="w-4 h-4 text-green-500" /> },
    { label: "Revenue", value: "₹2.4L", trend: "+8%", icon: <ArrowUp className="w-4 h-4 text-green-500" /> },
    { label: "Conversion", value: "6.2%", trend: "+0.8%", icon: <ArrowUp className="w-4 h-4 text-green-500" /> },
  ],
  topCampaigns: [
    { name: "Diwali Festival Sale", border: "border-l-4 border-green-400", conversion: "12.4%", revenue: "₹2.8L", roi: "5.2x", status: "Active", color: "bg-gradient-to-r from-green-400 to-emerald-500" },
    { name: "Winter Collection", border: "border-l-4 border-blue-400", conversion: "9.8%", revenue: "₹1.9L", roi: "4.1x", status: "Paused", color: "bg-gradient-to-r from-blue-400 to-indigo-500" },
    { name: "Tech Startup Promo", border: "border-l-4 border-purple-400", conversion: "8.2%", revenue: "₹1.2L", roi: "3.8x", status: "Active", color: "bg-gradient-to-r from-purple-400 to-violet-500" },
  ],
  regions: [
    { name: "Maharashtra", revenue: "₹3.2L", campaigns: 8, color: "bg-green-400" },
    { name: "Karnataka", revenue: "₹2.1L", campaigns: 6, color: "bg-blue-400" },
    { name: "Tamil Nadu", revenue: "₹1.8L", campaigns: 5, color: "bg-purple-400" },
    { name: "Gujarat", revenue: "₹1.4L", campaigns: 5, color: "bg-orange-400" },
  ],
  activities: [
    { icon: <TrendingUp className="w-5 h-5" />, color: "from-green-400 to-emerald-500", title: "Campaign exceeded target", desc: "Diwali Festival Sale surpassed its revenue goal.", time: "2h ago", location: "Mumbai" },
    { icon: <Users className="w-5 h-5" />, color: "from-blue-400 to-indigo-500", title: "New audience segment", desc: "Winter Collection reached a new demographic.", time: "5h ago", location: "Bangalore" },
    { icon: <Award className="w-5 h-5" />, color: "from-purple-400 to-pink-500", title: "ROI milestone achieved", desc: "Tech Startup Promo hit 3.8x ROI.", time: "1d ago", location: "Chennai" },
  ],
};

const AnimatedProgress = ({ value, color }: { value: number; color: string }) => (
  <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden mt-2">
    <div
      className={`h-2 rounded-full transition-all duration-2000 ${color}`}
      style={{ width: `${value}%` }}
    />
  </div>
);

export const TabsContentOverview: React.FC<{ data?: OverviewData }> = ({ data = defaultData }) => {
  console.log('TabsContentOverview rendering with data:', data);
  
  try {
    return (
      <div className="space-y-10">
        {/* Section 1: Enhanced Stats Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Campaigns */}
          <MetricCard
            icon={<Target className="w-7 h-7 text-white" />}
            label="Campaigns"
            value={data.totalCampaigns}
            subtext={data.campaignsTrend}
            colorClass="from-blue-500 via-blue-600 to-indigo-700"
            tooltip="Total number of campaigns"
            trend={{ direction: "up", value: data.campaignsTrend }}
          />
          {/* Total Revenue */}
          <MetricCard
            icon={<DollarSign className="w-7 h-7 text-white" />}
            label="Revenue"
            value={data.totalRevenue}
            subtext={data.revenueTrend}
            colorClass="from-green-500 via-green-600 to-emerald-600"
            tooltip="Total revenue generated"
            trend={{ direction: "up", value: data.revenueTrend }}
          />
          {/* Total Reach */}
          <MetricCard
            icon={<Users className="w-7 h-7 text-white" />}
            label="Reach"
            value={data.totalReach}
            subtext={data.reachTrend}
            colorClass="from-purple-500 via-purple-600 to-violet-600"
            tooltip="Total reach across campaigns"
            trend={{ direction: "up", value: data.reachTrend }}
          />
          {/* Avg. Conversion */}
          <MetricCard
            icon={<TrendingUp className="w-7 h-7 text-white" />}
            label="Avg. Conversion"
            value={data.avgConversion}
            subtext={data.conversionTrend}
            colorClass="from-orange-500 via-orange-600 to-red-500"
            tooltip="Average conversion rate"
            trend={{ direction: "up", value: data.conversionTrend }}
          />
        </div>
        {/* Section 2: Performance Insights Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Campaign Performance Chart (spans 2 columns) */}
          <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl col-span-2 flex flex-col">
            <div className="flex flex-row items-center gap-3 pb-2">
              <div className="bg-blue-500 rounded-xl p-2"><BarChart3 className="w-6 h-6 text-white" /></div>
              <span className="text-lg font-bold">Campaign Performance</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4">
                {data.performanceMetrics.map((m) => (
                  <div key={m.label} className="flex flex-col items-center">
                    <span className="text-xl font-bold text-slate-800">{m.value}</span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600">{m.icon}{m.trend}</span>
                    <span className="text-xs text-slate-500">{m.label}</span>
                  </div>
                ))}
              </div>
              <div className="h-36 w-full rounded-xl bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center">
                {/* Placeholder for chart */}
                <span className="text-slate-400 font-semibold">[Chart Area]</span>
              </div>
            </div>
          </div>
          {/* Top Performing Campaigns */}
          <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl flex flex-col">
            <div className="flex flex-row items-center gap-3 pb-2">
              <div className="bg-green-500 rounded-xl p-2"><Star className="w-6 h-6 text-white" /></div>
              <span className="text-lg font-bold">Top Performing Campaigns</span>
            </div>
            <div className="flex flex-col gap-4">
              {data.topCampaigns.map((c) => (
                <div key={c.name} className={`flex flex-col p-3 rounded-lg mb-2 ${c.color} ${c.border} shadow-md`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-base">{c.name}</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-bold text-white ml-2">{c.status}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-white/90">
                    <span>Conversion: {c.conversion}</span>
                    <span>Revenue: {c.revenue}</span>
                    <span>ROI: {c.roi}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Section 3: Regional Performance & Activity */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Regional Performance */}
          <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl flex flex-col">
            <div className="flex flex-row items-center gap-3 pb-2">
              <div className="bg-purple-500 rounded-xl p-2"><MapPin className="w-6 h-6 text-white" /></div>
              <span className="text-lg font-bold">Regional Performance</span>
            </div>
            <div className="flex flex-col gap-4">
              {data.regions.map((r) => (
                <div key={r.name} className="flex items-center gap-4">
                  <span className={`w-3 h-3 rounded-full ${r.color} block`} />
                  <span className="font-semibold text-slate-700">{r.name}</span>
                  <span className="text-xs text-slate-500">{r.revenue}</span>
                  <span className="text-xs text-slate-400">{r.campaigns} campaigns</span>
                </div>
              ))}
            </div>
          </div>
          {/* Recent Activity Feed */}
          <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl flex flex-col border-t-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            <div className="flex flex-row items-center gap-3 pb-2">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
              </span>
              <span className="text-lg font-bold">Recent Activity</span>
              <button className="ml-auto bg-white/80 hover:bg-white/90 rounded-lg p-2 transition" aria-label="Filter">
                <Filter className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {data.activities.map((a, i) => (
                <div key={i} className={`flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r ${a.color} border-l-4 shadow-md`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">{a.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-white text-base">{a.title}</div>
                    <div className="text-xs text-white/90">{a.desc}</div>
                    <div className="text-xs text-white/70 mt-1">{a.time} • {a.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Section 4: Quick Actions */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Quick Campaign Creation */}
          <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl flex flex-col group transition-all duration-700 hover:scale-105 hover:shadow-3xl hover:bg-gradient-to-br hover:from-green-100 hover:to-emerald-100">
            <div className="flex flex-row items-center gap-3 pb-2">
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-3 shadow-lg">
                <Plus className="w-7 h-7 text-white" />
              </div>
              <span className="text-lg font-bold">Create New Campaign</span>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-slate-700 font-medium">Launch a new marketing campaign in seconds. Use AI-powered tools to generate content, set budgets, and target the right audience with ease.</p>
              <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 text-lg" onClick={() => alert('Create Campaign!')}>
                <Zap className="w-5 h-5" /> Create Campaign
              </button>
            </div>
          </div>
          {/* Performance Insights */}
          <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl flex flex-col group transition-all duration-700 hover:scale-105 hover:shadow-3xl hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100">
            <div className="flex flex-row items-center gap-3 pb-2">
              <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl p-3 shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <span className="text-lg font-bold">View Analytics</span>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-slate-700 font-medium">Dive deep into your campaign analytics. Visualize trends, compare performance, and unlock actionable insights to maximize your ROI.</p>
              <button className="flex items-center gap-2 bg-blue-500 hover:bg-purple-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 text-lg" onClick={() => alert('View Analytics!')}>
                <Sparkles className="w-5 h-5" /> View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in TabsContentOverview:', error);
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h3>
        <p className="text-gray-600">Error loading overview data</p>
        <pre className="mt-4 text-xs text-gray-500 bg-gray-100 p-2 rounded">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
}; 
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import FilterBar from '../components/FilterBar';
import { useApp } from '../context/AppContext';
import { radarAPI } from '../services/api';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  Building, 
  Target, 
  AlertCircle,
  Loader,
  Lightbulb
} from 'lucide-react';
import toast from 'react-hot-toast';

// Analytics KPI Card Component
const AnalyticsCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-2 ${colorClasses[color].split(' ').slice(-2).join(' ')}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color].split(' ').slice(0, -2).join(' ')}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

// Loading Skeleton for Analytics Cards
const AnalyticsCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

const Analytics = () => {
  const { filters } = useApp();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check if required filters are selected
  const canLoadAnalytics = filters.skill && filters.district;

  // Load analytics data when filters change
  useEffect(() => {
    if (canLoadAnalytics) {
      loadAnalyticsData();
    } else {
      setAnalyticsData(null);
      setTrendData([]);
    }
  }, [filters, canLoadAnalytics]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load analytics data
      const analyticsResponse = await radarAPI.getAnalytics(
        filters.skill, 
        filters.district, 
        filters.timeWindow
      );
      
      setAnalyticsData(analyticsResponse.data);

      // Generate mock trend data (replace with real API call when available)
      const mockTrendData = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
        demand: Math.floor(Math.random() * 100) + 50,
        supply: Math.floor(Math.random() * 80) + 40,
      }));
      
      setTrendData(mockTrendData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Detailed Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            In-depth analysis of skill demand, supply, and market dynamics
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <FilterBar />
        </div>

        {!canLoadAnalytics ? (
          // Selection Required State
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Select District and Skill for Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Please select both a district and a skill from the filters above to view detailed analytics 
              including demand scores, salary ranges, and market insights.
            </p>
          </div>
        ) : loading ? (
          // Loading State
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <AnalyticsCardSkeleton key={index} />
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center h-80">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading analytics...</span>
              </div>
            </div>
          </div>
        ) : analyticsData ? (
          // Analytics Content
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnalyticsCard
                title="Demand Score"
                value={`${analyticsData.demandScore || 0}/100`}
                subtitle="Market demand intensity"
                icon={Target}
                color="blue"
              />
              
              <AnalyticsCard
                title="Job Postings"
                value={(analyticsData.jobPostings || 0).toLocaleString()}
                subtitle={`Last ${filters.timeWindow} days`}
                icon={Building}
                color="green"
              />
              
              <AnalyticsCard
                title="Available Talent"
                value={(analyticsData.availableTalent || 0).toLocaleString()}
                subtitle="Skilled professionals"
                icon={Users}
                color="purple"
              />
              
              <AnalyticsCard
                title="Time to Fill"
                value={analyticsData.timeToFill || 'N/A'}
                subtitle="Average hiring time"
                icon={Clock}
                color="orange"
              />
              
              <AnalyticsCard
                title="Average Salary"
                value={analyticsData.salary?.avg ? formatCurrency(analyticsData.salary.avg) : 'N/A'}
                subtitle={`${analyticsData.salary?.min ? formatCurrency(analyticsData.salary.min) : 'N/A'} - ${analyticsData.salary?.max ? formatCurrency(analyticsData.salary.max) : 'N/A'}`}
                icon={DollarSign}
                color="green"
              />
              
              <AnalyticsCard
                title="Market Competition"
                value={analyticsData.marketCompetition?.dsi || 'N/A'}
                subtitle={`${analyticsData.marketCompetition?.activeEmployers || 0} active employers`}
                icon={TrendingUp}
                color="red"
              />
            </div>

            {/* Demand vs Supply Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Demand vs Supply Trend
              </h2>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="supplyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="month" 
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <YAxis className="text-gray-600 dark:text-gray-400" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgb(31 41 55)',
                        border: '1px solid rgb(75 85 99)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="demand" 
                      stroke="#3B82F6" 
                      fillOpacity={1} 
                      fill="url(#demandGradient)"
                      name="Demand"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="supply" 
                      stroke="#10B981" 
                      fillOpacity={1} 
                      fill="url(#supplyGradient)"
                      name="Supply"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Market Insights & Recommendations */}
            {analyticsData.recommendation && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
                      Market Insights & Recommendations
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                      {analyticsData.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Talent Supply Details */}
            {analyticsData.talentSupply && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Talent Supply Breakdown
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Talent</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {(analyticsData.talentSupply.total || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">High Skilled</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {(analyticsData.talentSupply.highSkilled || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${analyticsData.talentSupply.total ? 
                            (analyticsData.talentSupply.highSkilled / analyticsData.talentSupply.total) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {analyticsData.talentSupply.total ? 
                        Math.round((analyticsData.talentSupply.highSkilled / analyticsData.talentSupply.total) * 100) : 0}% 
                      are highly skilled
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Market Competition
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Active Employers</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {analyticsData.marketCompetition?.activeEmployers || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">DSI Score</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {analyticsData.marketCompetition?.dsi || 'N/A'}
                      </span>
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        A higher DSI indicates more competition among employers for talent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // No Data State
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Analytics Data Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Analytics data is not available for the selected combination of skill and district. 
              Try selecting different filters or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;

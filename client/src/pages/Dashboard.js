import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FilterBar from '../components/FilterBar';
import SkillsTable from '../components/SkillsTable';
import { useApp } from '../context/AppContext';
import { radarAPI } from '../services/api';
import { TrendingUp, Users, Building, Calendar, Loader, DollarSign, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// KPI Cards Component
const StatsCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };

  const trendColor = trend?.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const trendBg = trend?.startsWith('+') ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
              {trend && (
                <div className="ml-2 flex items-baseline text-sm font-semibold">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${trendBg} ${trendColor}`}>
                    {trend}
                  </span>
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
  </div>
);

const Dashboard = () => {
  const { filters, stats, loading: globalLoading } = useApp();
  const [dashboardData, setDashboardData] = useState({
    topSkills: [],
    loading: false,
  });

  // Load dashboard data when filters change
  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));

      // Fetch top skills data
      const topSkillsResponse = await radarAPI.getTopSkills(filters.district, filters.timeWindow);
      
      setDashboardData({
        topSkills: topSkillsResponse.data || [],
        loading: false,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const isLoading = globalLoading || dashboardData.loading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Labour Market Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time insights into job market trends and skill demands
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <FilterBar />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <LoadingSkeleton />
              </div>
            ))
          ) : stats ? (
            <>
              <StatsCard
                title="Total Job Postings"
                value={stats.supplyRecords?.toLocaleString() || '0'}
                trend="+12.4%"
                icon={TrendingUp}
                color="blue"
              />
              <StatsCard
                title="Top Skill"
                value="React.js"
                trend="+18.2%"
                icon={TrendingUp}
                color="green"
              />
              <StatsCard
                title="Avg. Salary"
                value="₹9.8L"
                trend="+5.3%"
                icon={DollarSign}
                color="orange"
              />
              <StatsCard
                title="Talent Gap"
                value="38%"
                trend="+2.1%"
                icon={AlertCircle}
                color="red"
              />
            </>
          ) : (
            // Placeholder when no stats
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No statistics available</p>
            </div>
          )}
        </div>

        {/* Skills Table */}
        <div className="mb-8">
          <SkillsTable data={[]} loading={isLoading} />
        </div>

        {/* Top Skills Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Top 10 In-Demand Skills
            </h2>
            {filters.district || filters.timeWindow !== '30' ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {filters.district && `District: ${filters.district} • `}
                Time: Last {filters.timeWindow} days
              </div>
            ) : null}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-80">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : dashboardData.topSkills.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.topSkills.slice(0, 10)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="skill" 
                    className="text-gray-600 dark:text-gray-400"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis className="text-gray-600 dark:text-gray-400" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgb(31 41 55)',
                      border: '1px solid rgb(75 85 99)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    formatter={(value, name) => [value, 'Job Count']}
                    labelFormatter={(label) => `Skill: ${label}`}
                  />
                  <Bar 
                    dataKey="jobCount" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400">
              <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No skill data available</p>
              <p className="text-sm text-center">
                Try adjusting your filters or check back later when data is available.
              </p>
            </div>
          )}
        </div>

        {/* Additional Info Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
            About the Dashboard
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            This dashboard provides real-time insights into job market trends across different districts and skills. 
            Use the filters above to explore specific regions, skills, or time periods. The data is updated regularly 
            to ensure you have the most current market intelligence.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

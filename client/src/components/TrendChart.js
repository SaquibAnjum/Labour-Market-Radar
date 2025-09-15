import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

const TrendChart = ({ data, loading, skillId }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatSalary = (amount) => {
    if (!amount) return 'N/A';
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Demand Trend for {skillId}
            </h3>
            <p className="text-sm text-gray-500">
              Job postings over time
            </p>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            Last 90 days
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {data.length > 0 ? (
          <div className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-medium text-gray-900">
                              {formatDate(label)}
                            </p>
                            <div className="space-y-1 text-sm">
                              <p className="text-blue-600">
                                Jobs: <span className="font-medium">{data.count}</span>
                              </p>
                              {data.avgSalaryMin && (
                                <p className="text-green-600">
                                  Avg Salary: {formatSalary(data.avgSalaryMin)} - {formatSalary(data.avgSalaryMax)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    fill="#dbeafe"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {data.reduce((sum, item) => sum + item.count, 0)}
                </div>
                <div className="text-sm text-blue-600">Total Jobs</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.count, 0) / data.length) : 0}
                </div>
                <div className="text-sm text-green-600">Avg Daily</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {data.length > 0 ? data[data.length - 1].count : 0}
                </div>
                <div className="text-sm text-purple-600">Latest</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No trend data available</p>
              <p className="text-sm text-gray-400">
                Data will appear as jobs are processed
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendChart;

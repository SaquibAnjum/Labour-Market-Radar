import React from 'react';
import { Users, Clock, DollarSign, Building, TrendingUp, AlertCircle } from 'lucide-react';

const EmployerAnalytics = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Employer Analytics</h3>
        </div>
        <div className="p-6 text-center text-gray-500">
          <Building className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>Select a skill to view employer analytics</p>
        </div>
      </div>
    );
  }

  const formatSalary = (amount) => {
    if (!amount) return 'N/A';
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  const getDSIStatus = (dsi) => {
    if (!dsi) return { status: 'Unknown', color: 'gray' };
    if (dsi > 2) return { status: 'High Competition', color: 'red' };
    if (dsi > 1) return { status: 'Moderate Competition', color: 'yellow' };
    return { status: 'Low Competition', color: 'green' };
  };

  const dsiStatus = getDSIStatus(data.dsi);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Employer Analytics</h3>
        <p className="text-sm text-gray-500">Market insights for hiring</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Demand Overview */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Demand Overview</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {data.demand?.count || 0}
                  </div>
                  <div className="text-sm text-blue-600">Job Postings</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-green-900">
                    {data.demand?.employers || 0}
                  </div>
                  <div className="text-sm text-green-600">Active Employers</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Information */}
        {(data.demand?.avgSalaryMin || data.demand?.avgSalaryMax) && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Salary Range</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatSalary(data.demand.avgSalaryMin)} - {formatSalary(data.demand.avgSalaryMax)}
                  </div>
                  <div className="text-sm text-gray-600">Average salary range</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Supply Information */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Talent Supply</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-purple-900">
                    {data.supply?.candidatesTotal || 0}
                  </div>
                  <div className="text-sm text-purple-600">Total Candidates</div>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-orange-900">
                    {data.supply?.candidatesAboveScore70 || 0}
                  </div>
                  <div className="text-sm text-orange-600">High-Skilled (70+ Score)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Competition */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Market Competition</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  DSI: {data.dsi?.toFixed(2) || 'N/A'}
                </div>
                <div className={`text-sm font-medium ${
                  dsiStatus.color === 'red' ? 'text-red-600' :
                  dsiStatus.color === 'yellow' ? 'text-yellow-600' :
                  dsiStatus.color === 'green' ? 'text-green-600' :
                  'text-gray-600'
                }`}>
                  {dsiStatus.status}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                dsiStatus.color === 'red' ? 'bg-red-100 text-red-700' :
                dsiStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                dsiStatus.color === 'green' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {data.dsi > 1 ? 'High' : 'Low'} Competition
              </div>
            </div>
          </div>
        </div>

        {/* Time to Fill */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Hiring Timeline</h4>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <div className="text-lg font-semibold text-blue-900">
                  {data.timeToFillEstimateDays || 'N/A'} days
                </div>
                <div className="text-sm text-blue-600">Estimated time to fill</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerAnalytics;

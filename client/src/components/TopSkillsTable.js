import React from 'react';
import { TrendingUp, DollarSign, Building, Users } from 'lucide-react';

const TopSkillsTable = ({ data, loading, onSkillSelect, selectedSkill }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleSkillClick = (skillId) => {
    onSkillSelect(skillId);
  };

  const formatSalary = (amount) => {
    if (!amount) return 'N/A';
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  const getDSIColor = (dsi) => {
    if (!dsi) return 'text-gray-500';
    if (dsi > 2) return 'text-red-600';
    if (dsi > 1) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Top Skills in Demand</h3>
        <p className="text-sm text-gray-500">Click on a skill to view detailed analytics</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skill
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Demand
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trend Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DSI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salary Range
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employers
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((skill, index) => (
              <tr
                key={skill.skillId}
                className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedSkill === skill.skillId ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                }`}
                onClick={() => handleSkillClick(skill.skillId)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {skill.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {skill.skillId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-gray-900">
                      {skill.demandCount}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {skill.demandTrendScore?.toFixed(2) || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getDSIColor(skill.dsi)}`}>
                    {skill.dsi ? skill.dsi.toFixed(2) : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                    <span>
                      {skill.avgSalaryMin && skill.avgSalaryMax
                        ? `${formatSalary(skill.avgSalaryMin)} - ${formatSalary(skill.avgSalaryMax)}`
                        : 'N/A'
                      }
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Building className="h-4 w-4 text-blue-500 mr-1" />
                    <span>{skill.employers || 0}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="px-6 py-8 text-center text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No skills data available for the selected filters</p>
        </div>
      )}
    </div>
  );
};

export default TopSkillsTable;

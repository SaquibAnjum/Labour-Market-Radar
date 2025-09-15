import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const SkillsTable = ({ data = [], loading = false }) => {
  // Mock data for demonstration - replace with real data from API
  const mockData = [
    {
      skill: 'React.js',
      category: 'Frontend Development',
      district: 'Bangalore Urban',
      demand: 1243,
      trend: '+18.2%',
      trendUp: true,
      avgSalary: '₹12.4L'
    },
    {
      skill: 'Node.js',
      category: 'Backend Development',
      district: 'Hyderabad',
      demand: 982,
      trend: '+12.7%',
      trendUp: true,
      avgSalary: '₹11.2L'
    },
    {
      skill: 'Data Science',
      category: 'Analytics',
      district: 'Mumbai City',
      demand: 845,
      trend: '+9.4%',
      trendUp: true,
      avgSalary: '₹14.8L'
    },
    {
      skill: 'Cloud Computing',
      category: 'Infrastructure',
      district: 'Pune',
      demand: 723,
      trend: '+15.3%',
      trendUp: true,
      avgSalary: '₹13.5L'
    },
    {
      skill: 'UI/UX Design',
      category: 'Design',
      district: 'Delhi',
      demand: 612,
      trend: '-2.1%',
      trendUp: false,
      avgSalary: '₹9.8L'
    }
  ];

  // Transform API data to match expected format
  const transformApiData = (apiData) => {
    return apiData.map((item, index) => ({
      skill: item.skill || item.skillName || `Skill ${index + 1}`,
      category: item.category || 'Technology',
      district: item.district || 'Unknown District',
      demand: item.demand || item.jobCount || 0,
      trend: item.trend || '+0%',
      trendUp: item.trendUp !== undefined ? item.trendUp : (item.trend && item.trend.startsWith('+')),
      avgSalary: item.avgSalary || '₹0L'
    }));
  };

  const tableData = data.length > 0 ? transformApiData(data) : mockData;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Skill Demand Analysis
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Detailed breakdown of skill demand across districts
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Skill Demand Analysis
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          Detailed breakdown of skill demand across districts
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Skill
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        District
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Demand
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Trend
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Avg. Salary
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {tableData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.skill}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {item.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {item.district}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {(item.demand || 0).toLocaleString()} postings
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            item.trendUp 
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                          }`}>
                            {item.trendUp ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {item.trend}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.avgSalary}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsTable;

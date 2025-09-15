import React, { useEffect, useState } from 'react';
import FilterBar from '../components/FilterBar';
import { useApp } from '../context/AppContext';
import { radarAPI } from '../services/api';
import { Map, Loader, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const Heatmap = () => {
  const { filters } = useApp();
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load heatmap data when filters change
  useEffect(() => {
    loadHeatmapData();
  }, [filters]);

  const loadHeatmapData = async () => {
    try {
      setLoading(true);
      const response = await radarAPI.getHeatmap(filters.skill, filters.timeWindow);
      setHeatmapData(response.data || []);
    } catch (error) {
      console.error('Error loading heatmap data:', error);
      toast.error('Failed to load heatmap data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate color intensity based on job count
  const getColorIntensity = (jobCount, maxJobs) => {
    if (maxJobs === 0) return 'bg-gray-200 dark:bg-gray-700';
    
    const intensity = jobCount / maxJobs;
    
    if (intensity === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (intensity <= 0.2) return 'bg-blue-100 dark:bg-blue-900/20';
    if (intensity <= 0.4) return 'bg-blue-200 dark:bg-blue-800/30';
    if (intensity <= 0.6) return 'bg-blue-300 dark:bg-blue-700/40';
    if (intensity <= 0.8) return 'bg-blue-400 dark:bg-blue-600/50';
    return 'bg-blue-500 dark:bg-blue-500/60';
  };

  const maxJobs = heatmapData.length > 0 ? Math.max(...heatmapData.map(d => d.jobCount)) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Geographic Heatmap
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Interactive visualization showing job distribution across districts for selected skills
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <FilterBar />
        </div>

        {/* Map Container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Map Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Map className="h-5 w-5 mr-2" />
                District Job Distribution
              </h2>
              {filters.skill && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Skill: {filters.skill} • Last {filters.timeWindow} days
                </div>
              )}
            </div>
          </div>

          {/* Map Content */}
          <div className="p-6">
            {loading ? (
              // Loading state
              <div className="flex items-center justify-center py-20">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading heatmap data...</span>
              </div>
            ) : heatmapData.length === 0 ? (
              // No data state
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                <BarChart3 className="h-16 w-16 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Data Available</h3>
                <p className="text-sm text-center max-w-md">
                  {filters.skill 
                    ? `No job data found for "${filters.skill}" in the selected time period.`
                    : 'Please select a skill from the filters above to see the geographic distribution of job opportunities.'
                  }
                </p>
              </div>
            ) : (
              // Heatmap visualization
              <div className="space-y-4">
                {/* District Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {heatmapData.map((district, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getColorIntensity(district.jobCount, maxJobs)}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {district.district}
                        </h3>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {district.districtCode}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {district.jobCount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        job postings
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Districts</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {heatmapData.length}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {heatmapData.reduce((sum, d) => sum + d.jobCount, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average per District</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(heatmapData.reduce((sum, d) => sum + d.jobCount, 0) / heatmapData.length).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          {heatmapData.length > 0 && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Job Count Legend
              </h3>
              <div className="flex items-center space-x-4 flex-wrap">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">0</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/20"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Low (1-20%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-blue-300 dark:bg-blue-700/40"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Medium (40-60%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-blue-500 dark:bg-blue-500/60"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">High (80-100%)</span>
                </div>
                {maxJobs > 0 && (
                  <div className="ml-8 text-xs text-gray-500 dark:text-gray-400">
                    Max: {maxJobs.toLocaleString()} jobs
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
            How to Use the Heatmap
          </h3>
          <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
            <li>• Select a skill from the filters to see its geographic distribution</li>
            <li>• Each card represents a district with job count and color intensity</li>
            <li>• Darker colors indicate higher job concentrations</li>
            <li>• Use the time window filter to see trends over different periods</li>
            <li>• Hover over cards to see detailed information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
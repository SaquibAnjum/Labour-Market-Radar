import React, { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import FilterBar from '../components/FilterBar';
import { useApp } from '../context/AppContext';
import { radarAPI } from '../services/api';
import { Map, Loader, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// India topography GeoJSON URL (you can host your own or use a CDN)
const INDIA_TOPO_JSON = "https://cdn.jsdelivr.net/npm/india-atlas@3/states.json";

const Heatmap = () => {
  const { filters } = useApp();
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Load heatmap data when filters change
  useEffect(() => {
    if (filters.skill) {
      loadHeatmapData();
    } else {
      setHeatmapData([]);
    }
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

  // Get job count for a district
  const getJobCount = (districtName) => {
    const districtData = heatmapData.find(
      d => d.district.toLowerCase() === districtName.toLowerCase()
    );
    return districtData ? districtData.jobCount : 0;
  };

  // Calculate color intensity based on job count
  const getColorIntensity = (jobCount) => {
    if (!heatmapData.length) return '#e5e7eb'; // gray-200
    
    const maxJobs = Math.max(...heatmapData.map(d => d.jobCount));
    if (maxJobs === 0) return '#e5e7eb';
    
    const intensity = jobCount / maxJobs;
    
    if (intensity === 0) return '#e5e7eb'; // gray-200
    if (intensity <= 0.2) return '#dbeafe'; // blue-100
    if (intensity <= 0.4) return '#bfdbfe'; // blue-200
    if (intensity <= 0.6) return '#93c5fd'; // blue-300
    if (intensity <= 0.8) return '#60a5fa'; // blue-400
    return '#3b82f6'; // blue-500
  };

  // Handle mouse events for tooltip
  const handleMouseEnter = (geo, event) => {
    const districtName = geo.properties.NAME_1 || geo.properties.district;
    const jobCount = getJobCount(districtName);
    
    setTooltipContent({
      district: districtName,
      jobCount: jobCount
    });
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleMouseMove = (event) => {
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleMouseLeave = () => {
    setTooltipContent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Geographic Heatmap
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Interactive map showing job distribution across districts for selected skills
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
                India Districts Map
              </h2>
              {filters.skill && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Skill: {filters.skill} • Last {filters.timeWindow} days
                </div>
              )}
            </div>
          </div>

          {/* Map Content */}
          <div className="relative">
            {!filters.skill ? (
              // No skill selected state
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                <AlertCircle className="h-16 w-16 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a Skill to View Heatmap</h3>
                <p className="text-sm text-center max-w-md">
                  Please select a skill from the filters above to see the geographic distribution 
                  of job opportunities across different districts.
                </p>
              </div>
            ) : loading ? (
              // Loading state
              <div className="flex items-center justify-center py-20">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading map data...</span>
              </div>
            ) : (
              // Map display
              <div className="relative h-96 md:h-[600px]">
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{
                    scale: 1000,
                    center: [78.9629, 20.5937] // Center on India
                  }}
                  width={800}
                  height={600}
                  style={{ width: "100%", height: "100%" }}
                >
                  <ZoomableGroup>
                    <Geographies geography={INDIA_TOPO_JSON}>
                      {({ geographies }) =>
                        geographies.map((geo) => {
                          const districtName = geo.properties.NAME_1 || geo.properties.district;
                          const jobCount = getJobCount(districtName);
                          const fillColor = getColorIntensity(jobCount);

                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={fillColor}
                              stroke="#ffffff"
                              strokeWidth={0.5}
                              style={{
                                default: { outline: "none" },
                                hover: { 
                                  outline: "none", 
                                  fill: "#1e40af", // blue-800
                                  cursor: "pointer" 
                                },
                                pressed: { outline: "none" }
                              }}
                              onMouseEnter={(event) => handleMouseEnter(geo, event)}
                              onMouseMove={handleMouseMove}
                              onMouseLeave={handleMouseLeave}
                            />
                          );
                        })
                      }
                    </Geographies>
                  </ZoomableGroup>
                </ComposableMap>

                {/* Tooltip */}
                {tooltipContent && (
                  <div
                    className="absolute pointer-events-none z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm"
                    style={{
                      left: tooltipPosition.x + 10,
                      top: tooltipPosition.y - 10,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <div className="font-medium">{tooltipContent.district}</div>
                    <div className="text-gray-300">
                      Jobs: {tooltipContent.jobCount.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legend */}
          {filters.skill && heatmapData.length > 0 && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Job Count Legend
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#e5e7eb' }}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">0</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dbeafe' }}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Low</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#93c5fd' }}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">High</span>
                </div>
                {heatmapData.length > 0 && (
                  <div className="ml-8 text-xs text-gray-500 dark:text-gray-400">
                    Max: {Math.max(...heatmapData.map(d => d.jobCount)).toLocaleString()} jobs
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
            <li>• Hover over districts to see exact job counts</li>
            <li>• Darker colors indicate higher job concentrations</li>
            <li>• Use the time window filter to see trends over different periods</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;

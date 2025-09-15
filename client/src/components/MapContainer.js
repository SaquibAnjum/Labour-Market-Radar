import React from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { MapPin } from 'lucide-react';

const MapContainer = ({ data, loading, selectedSkill }) => {
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

  // India map data (simplified)
  const indiaMapData = {
    type: "Topology",
    objects: {
      india: {
        type: "GeometryCollection",
        geometries: [
          {
            type: "Polygon",
            coordinates: [[[68.176645, 7.965535], [97.402561, 7.965535], [97.402561, 35.49401], [68.176645, 35.49401], [68.176645, 7.965535]]]
          }
        ]
      }
    }
  };

  // Create a map of district codes to demand scores
  const demandMap = data.reduce((acc, item) => {
    acc[item.districtCode] = item.demandTrendScore || 0;
    return acc;
  }, {});

  const getMaxDemand = () => {
    const values = Object.values(demandMap);
    return values.length > 0 ? Math.max(...values) : 1;
  };

  const getColor = (districtCode) => {
    const demand = demandMap[districtCode] || 0;
    const maxDemand = getMaxDemand();
    const intensity = maxDemand > 0 ? demand / maxDemand : 0;
    
    if (intensity === 0) return '#f3f4f6';
    if (intensity < 0.2) return '#dbeafe';
    if (intensity < 0.4) return '#93c5fd';
    if (intensity < 0.6) return '#60a5fa';
    if (intensity < 0.8) return '#3b82f6';
    return '#1d4ed8';
  };

  const getTooltipText = (districtCode) => {
    const demand = demandMap[districtCode] || 0;
    const district = data.find(d => d.districtCode === districtCode);
    return district ? 
      `${district.districtName}: ${demand.toFixed(2)} demand score` :
      `${districtCode}: No data`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {selectedSkill ? `Demand Heatmap for ${selectedSkill}` : 'Demand Heatmap'}
        </h3>
        <p className="text-sm text-gray-500">
          {selectedSkill ? 'Click on districts to view detailed analytics' : 'Select a skill to view demand distribution'}
        </p>
      </div>
      
      <div className="p-6">
        {selectedSkill ? (
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Interactive map would be here</p>
                <p className="text-sm text-gray-400">
                  This would show a detailed India map with district-level demand visualization
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Top Districts by Demand</h4>
              <div className="space-y-1">
                {data
                  .sort((a, b) => (b.demandTrendScore || 0) - (a.demandTrendScore || 0))
                  .slice(0, 5)
                  .map((district, index) => (
                    <div key={district.districtCode} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {index + 1}. {district.districtName}
                      </span>
                      <span className="font-medium text-gray-900">
                        {(district.demandTrendScore || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Select a skill to view demand heatmap</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapContainer;

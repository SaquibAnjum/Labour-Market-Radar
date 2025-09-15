import React from 'react';
import { MapPin, Calendar, Filter, X, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FilterBar = () => {
  const { filters, districts, skills, setFilters, clearFilters } = useApp();

  const handleDistrictChange = (e) => {
    setFilters({ district: e.target.value });
  };

  const handleSkillChange = (e) => {
    setFilters({ skill: e.target.value });
  };

  const handleTimeWindowChange = (e) => {
    setFilters({ timeWindow: e.target.value });
  };

  const timeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>
        <button
          onClick={clearFilters}
          className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <X className="h-4 w-4" />
          <span>Clear Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* District Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            District
          </label>
          <select
            value={filters.district}
            onChange={handleDistrictChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Districts</option>
            {districts.map((district) => (
              <option key={district.code || district.id} value={district.code || district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        {/* Skill Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Search className="inline h-4 w-4 mr-1" />
            Skill
          </label>
          <select
            value={filters.skill}
            onChange={handleSkillChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Skills</option>
            {skills.map((skill) => (
              <option key={skill.id || skill.name} value={skill.name || skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </div>

        {/* Time Window Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Time Window
          </label>
          <select
            value={filters.timeWindow}
            onChange={handleTimeWindowChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button for Mobile */}
        <div className="md:hidden">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Actions
          </label>
          <button
            onClick={clearFilters}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Applied Filters Display */}
      {(filters.district || filters.skill || filters.timeWindow !== '30') && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Applied filters:</span>
            
            {filters.district && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                District: {districts.find(d => (d.code || d.id) === filters.district)?.name || filters.district}
                <button
                  onClick={() => setFilters({ district: '' })}
                  className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.skill && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                Skill: {skills.find(s => (s.name || s.id) === filters.skill)?.name || filters.skill}
                <button
                  onClick={() => setFilters({ skill: '' })}
                  className="ml-1 hover:text-green-600 dark:hover:text-green-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.timeWindow !== '30' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                Time: {timeOptions.find(t => t.value === filters.timeWindow)?.label}
                <button
                  onClick={() => setFilters({ timeWindow: '30' })}
                  className="ml-1 hover:text-purple-600 dark:hover:text-purple-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;

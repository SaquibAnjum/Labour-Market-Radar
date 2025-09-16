import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Home, Map, TrendingUp, Sun, Moon, TestTube, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { radarAPI } from '../services/api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const location = useLocation();
  const { darkMode, toggleDarkMode, filters } = useApp();

  const handleExportData = async () => {
    try {
      // Fetch data from all endpoints
      const [statsRes, topSkillsRes, heatmapRes, districtsRes, skillsRes] = await Promise.all([
        radarAPI.getStats(),
        radarAPI.getTopSkills(filters.district, filters.timeWindow),
        radarAPI.getHeatmap(filters.skill, filters.timeWindow),
        radarAPI.getDistricts(),
        radarAPI.getSkills()
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        filters: filters,
        stats: statsRes.data,
        topSkills: topSkillsRes.data,
        heatmap: heatmapRes.data,
        districts: districtsRes.data,
        skills: skillsRes.data
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `labour-market-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Heatmap', path: '/heatmap', icon: Map },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'Adzuna Test', path: '/adzuna-test', icon: TestTube },
    { name: 'Integration Test', path: '/adzuna-integration-test', icon: CheckCircle },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                SkillRadar
              </span>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side - Export Button and Dark Mode Toggle */}
          <div className="flex items-center space-x-4">
                {/* Export Data Button */}
                <button 
                  onClick={handleExportData}
                  className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                >
                  Export Data
                </button>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Open menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden pb-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

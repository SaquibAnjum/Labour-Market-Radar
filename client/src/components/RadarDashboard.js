import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import StatsCards from './StatsCards';
import TopSkillsTable from './TopSkillsTable';
import FilterBar from './FilterBar';
import TrendChart from './TrendChart';

const RadarDashboard = () => {
  const [stats, setStats] = useState(null);
  const [topSkills, setTopSkills] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (stats) {
      fetchTopSkills();
    }
  }, [selectedDistrict, selectedTimeframe]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [statsRes, districtsRes, skillsRes] = await Promise.all([
        api.get('/radar/stats'),
        api.get('/radar/districts'),
        api.get('/radar/skills')
      ]);

      setStats(statsRes.data);
      setDistricts(districtsRes.data);
      setSkills(skillsRes.data);
      
      // Fetch top skills with default filters
      const topSkillsRes = await api.get('/radar/top-skills', {
        params: { district: '', time: selectedTimeframe }
      });
      setTopSkills(topSkillsRes.data);
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopSkills = async () => {
    try {
      const response = await api.get('/radar/top-skills', {
        params: { 
          district: selectedDistrict, 
          time: selectedTimeframe 
        }
      });
      setTopSkills(response.data);
    } catch (error) {
      console.error('Error fetching top skills:', error);
      toast.error('Failed to load top skills');
    }
  };

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
  };

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
  };

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill.skill);
    // Navigate to heatmap or show skill details
    toast.success(`Selected skill: ${skill.skill}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchInitialData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Labour Market Radar</h1>
              <p className="mt-1 text-sm text-gray-600">
                Real-time job market intelligence across India
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Filters */}
        <FilterBar
          districts={districts}
          skills={skills}
          selectedDistrict={selectedDistrict}
          selectedTimeframe={selectedTimeframe}
          selectedSkill={selectedSkill}
          onDistrictChange={handleDistrictChange}
          onTimeframeChange={handleTimeframeChange}
          onSkillChange={setSelectedSkill}
        />

        {/* Top Skills Table */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Skills by Demand-Supply Index (DSI)
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Skills ranked by market demand vs supply. Higher DSI indicates undersupply.
              </p>
            </div>
            <TopSkillsTable 
              skills={topSkills}
              onSkillSelect={handleSkillSelect}
              loading={loading}
            />
          </div>
        </div>

        {/* Trend Chart */}
        {selectedSkill && (
          <div className="mt-8">
            <TrendChart 
              skill={selectedSkill}
              district={selectedDistrict}
              timeframe={selectedTimeframe}
            />
          </div>
        )}

        {/* Market Insights */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Skills Tracked</span>
                <span className="font-semibold">{stats?.totalSkills || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Districts</span>
                <span className="font-semibold">{stats?.totalDistricts || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Job Postings Analyzed</span>
                <span className="font-semibold">{stats?.totalJobs || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average DSI</span>
                <span className="font-semibold">{stats?.avgDSI || '0.00'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">DSI Categories</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Undersupplied (DSI > 1.5)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Balanced (0.5 ≤ DSI ≤ 1.5)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Oversupplied (DSI < 0.5)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadarDashboard;

import React, { useState, useEffect } from 'react';
import  MapContainer  from './MapContainer';
import  TopSkillsTable  from './TopSkillsTable.js';
import  TrendChart  from './TrendChart.js';
import  EmployerAnalytics  from './EmployerAnalytics.js';
import  FilterBar  from './FilterBar.js';
import  StatsCards  from './StatsCards.js';
import  {api}  from '../services/api';

const Dashboard = () => {
  const [filters, setFilters] = useState({
    district: 'DL001',
    window: '30d',
    skillId: null
  });
  
  const [data, setData] = useState({
    topSkills: [],
    heatmapData: [],
    trendData: [],
    employerAnalytics: null,
    stats: null
  });
  
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [districtsRes, skillsRes] = await Promise.all([
        api.get('/radar/districts'),
        api.get('/radar/skills')
      ]);
      
      setDistricts(districtsRes.data);
      setSkills(skillsRes.data);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [topSkillsRes, heatmapRes, trendRes, analyticsRes, statsRes] = await Promise.all([
        api.get(`/radar/top-skills?district=${filters.district}&window=${filters.window}`),
        filters.skillId ? api.get(`/radar/heatmap?skillId=${filters.skillId}&window=${filters.window}`) : Promise.resolve({ data: { districts: [] } }),
        filters.skillId ? api.get(`/radar/trend?district=${filters.district}&skillId=${filters.skillId}`) : Promise.resolve({ data: { data: [] } }),
        filters.skillId ? api.get(`/radar/employer/analytics?district=${filters.district}&skillId=${filters.skillId}`) : Promise.resolve({ data: null }),
        api.get('/admin/stats')
      ]);

      setData({
        topSkills: topSkillsRes.data.items || [],
        heatmapData: heatmapRes.data.districts || [],
        trendData: trendRes.data.data || [],
        employerAnalytics: analyticsRes.data,
        stats: statsRes.data
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSkillSelect = (skillId) => {
    setFilters(prev => ({ ...prev, skillId }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Labour Market Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <FilterBar
        filters={filters}
        districts={districts}
        skills={skills}
        onFilterChange={handleFilterChange}
      />

      {data.stats && <StatsCards stats={data.stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <TopSkillsTable
            data={data.topSkills}
            loading={loading}
            onSkillSelect={handleSkillSelect}
            selectedSkill={filters.skillId}
          />
          
          {filters.skillId && (
            <EmployerAnalytics
              data={data.employerAnalytics}
              loading={loading}
            />
          )}
        </div>

        <div className="space-y-6">
          <MapContainer
            data={data.heatmapData}
            loading={loading}
            selectedSkill={filters.skillId}
          />
          
          {filters.skillId && (
            <TrendChart
              data={data.trendData}
              loading={loading}
              skillId={filters.skillId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

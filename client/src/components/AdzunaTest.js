import React, { useState } from 'react';
import { radarAPI } from '../services/api';

const AdzunaTest = () => {
  const [searchTerm, setSearchTerm] = useState('software developer');
  const [location, setLocation] = useState('Bangalore');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await radarAPI.searchAdzunaJobs({
        what: searchTerm,
        where: location,
        results_per_page: 10
      });
      
      if (response.data.success) {
        setResults(response.data.data);
      } else {
        setError(response.data.error || 'Search failed');
      }
    } catch (err) {
      setError('Network error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAndSave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await radarAPI.fetchAdzunaJobs({
        searchTerm,
        location,
        maxPages: 2
      });
      
      if (response.data.success) {
        alert(`Successfully saved ${response.data.data.jobsSaved} jobs to database!`);
      } else {
        setError(response.data.error || 'Fetch and save failed');
      }
    } catch (err) {
      setError('Network error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGetTrendingSkills = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await radarAPI.getAdzunaTrendingSkills('KA01', '30');
      
      if (response.data.success) {
        setResults({ trendingSkills: response.data.data });
      } else {
        setError(response.data.error || 'Failed to fetch trending skills');
      }
    } catch (err) {
      setError('Network error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGetStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await radarAPI.getAdzunaStats('KA01', '30');
      
      if (response.data.success) {
        setResults({ stats: response.data.data });
      } else {
        setError(response.data.error || 'Failed to fetch stats');
      }
    } catch (err) {
      setError('Network error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Adzuna API Integration Test</h2>
      
      {/* Search Form */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Search Jobs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Term
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., software developer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Bangalore"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Jobs'}
          </button>
          <button
            onClick={handleFetchAndSave}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Fetch & Save Jobs'}
          </button>
        </div>
      </div>

      {/* Analytics Buttons */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Analytics</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGetTrendingSkills}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Trending Skills'}
          </button>
          <button
            onClick={handleGetStats}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Statistics'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Results</h3>
          
          {/* Job Search Results */}
          {results.results && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Found {results.count} jobs (showing {results.results.length})
              </p>
              {results.results.map((job, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-lg text-blue-600">{job.title}</h4>
                  <p className="text-gray-700">{job.company?.display_name}</p>
                  <p className="text-sm text-gray-500">{job.location?.display_name}</p>
                  {job.salary_min && (
                    <p className="text-sm text-green-600">
                      Salary: ₹{job.salary_min.toLocaleString()}
                      {job.salary_max && ` - ₹${job.salary_max.toLocaleString()}`}
                    </p>
                  )}
                  <a 
                    href={job.redirect_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    View Job →
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Trending Skills Results */}
          {results.trendingSkills && (
            <div className="space-y-2">
              <h4 className="font-semibold">Trending Skills (Last 30 days)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {results.trendingSkills.map((skill, index) => (
                  <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                    <span className="font-medium">{skill.skill}</span>
                    <span className="text-gray-500 ml-2">({skill.count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics Results */}
          {results.stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Job Statistics</h4>
                <p>Total Jobs: {results.stats.totalJobs}</p>
                <p>Avg Salary: ₹{Math.round(results.stats.avgSalary).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Top Companies</h4>
                <ul className="text-sm space-y-1">
                  {results.stats.topCompanies.slice(0, 5).map((comp, index) => (
                    <li key={index}>
                      {comp.company} ({comp.jobCount} jobs)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdzunaTest;

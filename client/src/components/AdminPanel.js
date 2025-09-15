import React, { useState, useEffect } from 'react';
import { RefreshCw, Play, Pause, AlertTriangle, CheckCircle, Clock, Database, BarChart3 } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [sourceHealth, setSourceHealth] = useState([]);
  const [recentErrors, setRecentErrors] = useState([]);
  const [aggregationStatus, setAggregationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, healthRes, errorsRes, aggRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/sources/health'),
        api.get('/admin/errors'),
        api.get('/admin/aggregation/status')
      ]);

      setStats(statsRes.data);
      setSourceHealth(healthRes.data.sources);
      setRecentErrors(errorsRes.data.errors);
      setAggregationStatus(aggRes.data.aggregationStatus);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerScraping = async (source) => {
    try {
      await api.post('/admin/scrape/trigger', { source, urls: [] });
      toast.success(`${source} scraping triggered`);
    } catch (error) {
      toast.error(`Failed to trigger ${source} scraping`);
    }
  };

  const handleTriggerAggregation = async (window) => {
    try {
      await api.post('/admin/aggregation/trigger', { window });
      toast.success(`${window} aggregation triggered`);
    } catch (error) {
      toast.error(`Failed to trigger ${window} aggregation`);
    }
  };

  const handleReprocessErrors = async () => {
    try {
      const errorJobIds = recentErrors.map(error => error._id);
      await api.post('/admin/reprocess', { jobIds: errorJobIds });
      toast.success('Error jobs marked for reprocessing');
      loadAdminData();
    } catch (error) {
      toast.error('Failed to reprocess error jobs');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <button
          onClick={loadAdminData}
          className="btn btn-primary flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.totalJobs || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.uniqueJobs || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.pendingJobs || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Error Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.errorJobs || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Health */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Source Health</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {sourceHealth.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 capitalize">{source._id}</div>
                    <div className="text-sm text-gray-600">
                      {source.totalJobs} total jobs
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      source.successRate > 80 ? 'text-green-600' :
                      source.successRate > 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {source.successRate?.toFixed(1)}% success
                    </div>
                    <div className="text-xs text-gray-500">
                      {source.errorCount} errors
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aggregation Status */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Aggregation Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {aggregationStatus && Object.entries(aggregationStatus).map(([window, status]) => (
                <div key={window} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{window} Window</div>
                    <div className="text-sm text-gray-600">
                      {status.totalDemandRecords} demand records
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {status.lastUpdated ? 
                        new Date(status.lastUpdated).toLocaleString() : 
                        'Never'
                      }
                    </div>
                    <button
                      onClick={() => handleTriggerAggregation(window)}
                      className="btn btn-secondary text-xs mt-1"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Trigger
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Errors</h3>
            {recentErrors.length > 0 && (
              <button
                onClick={handleReprocessErrors}
                className="btn btn-primary text-sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reprocess All
              </button>
            )}
          </div>
        </div>
        <div className="p-6">
          {recentErrors.length > 0 ? (
            <div className="space-y-3">
              {recentErrors.slice(0, 10).map((error, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-red-900">{error.source}</div>
                    <div className="text-sm text-red-700 truncate">{error.error}</div>
                    <div className="text-xs text-red-600">
                      {new Date(error.fetchedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => api.post('/admin/reprocess', { jobIds: [error._id] })}
                      className="btn btn-secondary text-xs"
                    >
                      Reprocess
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-400" />
              <p>No recent errors</p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Triggers */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Manual Triggers</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['ncs', 'indeed', 'naukri', 'monster', 'government'].map((source) => (
              <button
                key={source}
                onClick={() => handleTriggerScraping(source)}
                className="btn btn-secondary flex items-center justify-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span className="capitalize">{source}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

import React from 'react';
import { TrendingUp, Users, MapPin, Briefcase, AlertCircle, CheckCircle } from 'lucide-react';

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      title: 'Total Jobs',
      value: stats.overview?.totalJobs || 0,
      icon: Briefcase,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Unique Jobs',
      value: stats.overview?.uniqueJobs || 0,
      icon: CheckCircle,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Active Districts',
      value: stats.overview?.totalDistricts || 0,
      icon: MapPin,
      color: 'purple',
      change: '+2'
    },
    {
      title: 'Skills Tracked',
      value: stats.overview?.totalSkills || 0,
      icon: TrendingUp,
      color: 'orange',
      change: '+5'
    },
    {
      title: 'Pending Jobs',
      value: stats.overview?.pendingJobs || 0,
      icon: AlertCircle,
      color: 'yellow',
      change: '-3%'
    },
    {
      title: 'Error Jobs',
      value: stats.overview?.errorJobs || 0,
      icon: AlertCircle,
      color: 'red',
      change: '+1%'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{card.change}</p>
              </div>
              <div className={`p-3 rounded-full border ${getColorClasses(card.color)}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;

import React, { useEffect, useState } from 'react';
import { getStats, getTopArticles, getViewsByCountry } from '../services/stats';
import { Eye, FileText, Users, TrendingUp, Globe, Calendar, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [topArticles, setTopArticles] = useState([]);
  const [viewsByCountry, setViewsByCountry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsData, articlesData, countryData] = await Promise.all([
        getStats(),
        getTopArticles(5, 'all'),
        getViewsByCountry(5)
      ]);
      setStats(statsData);
      setTopArticles(articlesData);
      setViewsByCountry(countryData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div>
        <h1 className="text-xl sm:text-2xl font-bold mb-6">Painel</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Visualizacoes Totais',
      value: (stats?.totalViews || 0).toLocaleString(),
      subtitle: 'Desde o inicio',
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Hoje',
      value: (stats?.viewsToday || 0).toLocaleString(),
      subtitle: 'Visualizacoes',
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Esta Semana',
      value: (stats?.viewsWeek || 0).toLocaleString(),
      subtitle: 'Ultimos 7 dias',
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Este Mes',
      value: (stats?.viewsMonth || 0).toLocaleString(),
      subtitle: 'Ultimos 30 dias',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  const contentCards = [
    {
      label: 'Total de Artigos',
      value: stats?.articlesCount || 0,
      icon: FileText,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      label: 'Usuarios',
      value: stats?.usersCount || 0,
      icon: Users,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50'
    }
  ];

  // Country code to name mapping (common ones)
  const countryNames = {
    PT: 'Portugal',
    BR: 'Brasil',
    US: 'Estados Unidos',
    ES: 'Espanha',
    FR: 'Franca',
    DE: 'Alemanha',
    GB: 'Reino Unido',
    IT: 'Italia',
    AO: 'Angola',
    MZ: 'Mocambique',
    CV: 'Cabo Verde'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Painel</h1>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400 hidden sm:inline">
              Atualizado: {lastUpdated.toLocaleTimeString('pt-PT')}
            </span>
          )}
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-brand hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Atualizar dados"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* View Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-gray-500 text-xs sm:text-sm font-medium truncate">
                  {card.label}
                </h3>
                <p className="text-xl sm:text-2xl font-bold mt-1">{card.value}</p>
                <span className="text-gray-400 text-xs font-medium mt-1 inline-block">
                  {card.subtitle}
                </span>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg ${card.bgColor} shrink-0`}>
                <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6">
        {contentCards.map((card, index) => (
          <div
            key={index}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${card.bgColor} shrink-0`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold">{card.value}</p>
                <h3 className="text-gray-500 text-sm font-medium">{card.label}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Articles */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-brand" />
            Artigos Mais Lidos
          </h2>
          {topArticles.length > 0 ? (
            <div className="space-y-3">
              {topArticles.map((article, index) => (
                <div key={article.postId} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" title={article.postTitle}>
                      {article.postTitle || 'Sem titulo'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {article.viewCount.toLocaleString()} visualizacoes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Nenhum dado disponivel</p>
          )}
        </div>

        {/* Views by Country */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe size={20} className="text-brand" />
            Visualizacoes por Pais
          </h2>
          {viewsByCountry.length > 0 ? (
            <div className="space-y-3">
              {viewsByCountry.map((item, index) => (
                <div key={item.country} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {countryNames[item.country] || item.country}
                    </p>
                    <p className="text-xs text-gray-400">
                      {parseInt(item.views).toLocaleString()} visualizacoes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Nenhum dado disponivel</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 sm:mt-8">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Acoes Rapidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <a
            href="/articles/new"
            className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-brand hover:shadow-sm transition-all text-center"
          >
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-gray-400 mb-2" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">Novo Artigo</span>
          </a>
          <a
            href="/media"
            className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-brand hover:shadow-sm transition-all text-center"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-700">Midia</span>
          </a>
          <a
            href="/tags"
            className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-brand hover:shadow-sm transition-all text-center"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-700">Tags</span>
          </a>
          <a
            href="/settings"
            className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-brand hover:shadow-sm transition-all text-center"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-700">Configuracoes</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

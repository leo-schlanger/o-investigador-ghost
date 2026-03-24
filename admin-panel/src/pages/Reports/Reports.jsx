import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Eye,
  Calendar,
  Users,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';

const Reports = () => {
  const [reportTypes, setReportTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('views');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const periods = [
    { id: 'today', label: 'Hoje' },
    { id: 'week', label: 'Ultima Semana' },
    { id: 'month', label: 'Ultimo Mes' },
    { id: 'year', label: 'Ultimo Ano' },
    { id: 'all', label: 'Todo o Periodo' }
  ];

  const typeIcons = {
    views: BarChart2,
    articles: FileText,
    users: Users
  };

  useEffect(() => {
    fetchReportTypes();
  }, []);

  useEffect(() => {
    if (selectedType) {
      fetchPreview();
    }
  }, [selectedType, selectedPeriod]);

  const fetchReportTypes = async () => {
    try {
      const response = await api.get('/api/reports/types');
      setReportTypes(response.data);
    } catch (err) {
      console.error('Error fetching report types:', err);
    }
  };

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/reports/preview/${selectedType}?period=${selectedPeriod}`
      );
      setPreview(response.data);
    } catch (err) {
      console.error('Error fetching preview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setDownloading(true);
    try {
      const response = await api.get(
        `/api/reports/export/${format}/${selectedType}?period=${selectedPeriod}`,
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `relatorio-${selectedType}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting report:', err);
      alert('Erro ao exportar relatorio');
    } finally {
      setDownloading(false);
    }
  };

  const renderPreviewTable = () => {
    if (!preview || !preview.data || preview.data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FileText size={48} className="mx-auto mb-2 opacity-50" />
          <p>Nenhum dado encontrado para este periodo</p>
        </div>
      );
    }

    const columns = Object.keys(preview.data[0]);

    const columnLabels = {
      title: 'Titulo',
      views: 'Visualizacoes',
      lastViewed: 'Ultima Visualizacao',
      status: 'Status',
      author: 'Autor',
      createdAt: 'Criado em',
      publishedAt: 'Publicado em',
      name: 'Nome',
      email: 'Email',
      role: 'Funcao',
      lastLogin: 'Ultimo Login'
    };

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {columnLabels[col] || col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {preview.data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {typeof row[col] === 'number' ? row[col].toLocaleString() : row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Relatorios</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Report Options */}
        <div className="lg:col-span-1 space-y-4">
          {/* Report Type Selection */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Tipo de Relatorio</h2>
            <div className="space-y-2">
              {reportTypes.map((type) => {
                const Icon = typeIcons[type.id] || FileText;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedType === type.id
                        ? 'bg-brand text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <div>
                      <p className="font-medium text-sm">{type.name}</p>
                      <p
                        className={`text-xs ${selectedType === type.id ? 'text-white/70' : 'text-gray-500'}`}
                      >
                        {type.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Period Selection */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Calendar size={16} />
              Periodo
            </h2>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand text-sm"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Export Buttons */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Download size={16} />
              Exportar
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => handleExport('excel')}
                disabled={downloading || loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <FileSpreadsheet size={18} />
                Exportar Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={downloading || loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <FileText size={18} />
                Exportar PDF
              </button>
            </div>
            {downloading && (
              <p className="text-xs text-gray-500 text-center mt-2">Gerando arquivo...</p>
            )}
          </div>
        </div>

        {/* Main Content - Preview */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-gray-500" />
                <h2 className="font-medium">Preview do Relatorio</h2>
                {preview && (
                  <span className="text-sm text-gray-500">({preview.count} registros)</span>
                )}
              </div>
              <button
                onClick={fetchPreview}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-brand hover:bg-gray-100 rounded-lg transition-colors"
                title="Atualizar preview"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                </div>
              ) : (
                renderPreviewTable()
              )}
            </div>

            {/* Preview Footer */}
            {preview && preview.data && preview.data.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-500">
                Mostrando ate 20 registros no preview. O arquivo exportado contera todos os dados.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

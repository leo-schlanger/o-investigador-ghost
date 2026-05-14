import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Save,
  Send,
  Clock,
  Eye,
  Mail,
  AlertCircle,
  Smartphone,
  Monitor,
  Settings,
  Image,
  FileText,
  Trash2,
  Plus,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Type,
  List,
  Link as LinkIcon,
  Quote,
  Newspaper,
  Users,
  Calendar,
  Layout,
  Palette,
  TestTube
} from 'lucide-react';
import {
  getCampaign,
  createCampaign,
  updateCampaign,
  sendCampaign,
  scheduleCampaign,
  sendTestEmail,
  getLists
} from '../../services/newsletter';
import { useNotification } from '../../context/NotificationContext';
import EmailPreview from './EmailPreview';
import { NEWSLETTER_TEMPLATES, getTemplateById, getDefaultBlockContent } from './templates';

// Block types with React icons for UI
const BLOCK_TYPES = [
  { type: 'header', label: 'Cabecalho', icon: Layout, description: 'Logo e masthead do jornal' },
  {
    type: 'hero',
    label: 'Destaque Principal',
    icon: Newspaper,
    description: 'Noticia em destaque com imagem'
  },
  {
    type: 'section-title',
    label: 'Titulo de Seccao',
    icon: Type,
    description: 'Separador de seccoes'
  },
  { type: 'article', label: 'Artigo', icon: FileText, description: 'Noticia com imagem e resumo' },
  {
    type: 'article-list',
    label: 'Lista de Artigos',
    icon: List,
    description: 'Lista simples de links'
  },
  { type: 'text', label: 'Texto', icon: Type, description: 'Paragrafo de texto livre' },
  { type: 'quote', label: 'Citacao', icon: Quote, description: 'Citacao em destaque' },
  { type: 'button', label: 'Botao CTA', icon: LinkIcon, description: 'Botao de acao' },
  { type: 'divider', label: 'Separador', icon: GripVertical, description: 'Linha divisoria' },
  { type: 'footer', label: 'Rodape', icon: Layout, description: 'Rodape com links e copyright' }
];

const CampaignEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useNotification();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  const isEditing = !!id && id !== 'new';

  const [campaign, setCampaign] = useState({
    name: '',
    subject: '',
    preheader: '',
    senderName: '',
    senderEmail: '',
    replyTo: '',
    listIds: [],
    blocks: [],
    status: 'draft'
  });

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState('content');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    fetchLists();
    if (isEditing) {
      fetchCampaign();
    } else if (templateId) {
      loadTemplate(templateId);
    } else {
      // Initialize with default blocks
      setCampaign((c) => ({
        ...c,
        blocks: [
          { id: 'header-1', type: 'header', content: getDefaultBlockContent('header') },
          { id: 'hero-1', type: 'hero', content: getDefaultBlockContent('hero') },
          { id: 'footer-1', type: 'footer', content: getDefaultBlockContent('footer') }
        ]
      }));
    }
  }, [id, templateId]);

  const fetchLists = async () => {
    try {
      const response = await getLists();
      setLists(response.data || []);
      setIsMock(response.isMock || false);
    } catch (err) {
      console.error('Error fetching lists:', err);
    }
  };

  const fetchCampaign = async () => {
    setLoading(true);
    try {
      const data = await getCampaign(id);
      if (data) {
        setCampaign(data);
        setIsMock(data.isMock || false);
      } else {
        setError('Campanha nao encontrada');
      }
    } catch (err) {
      console.error('Error fetching campaign:', err);
      setError('Erro ao carregar campanha');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (templateId) => {
    const template = getTemplateById(templateId);
    if (template) {
      const blocks = template.sections.map((section, idx) => ({
        id: `${section}-${idx}`,
        type: section.replace('-', ''),
        content: getDefaultBlockContent(section)
      }));
      setCampaign((c) => ({
        ...c,
        name: `Nova ${template.name}`,
        blocks
      }));
    }
  };

  const handleSave = async (asDraft = true) => {
    if (!campaign.name || !campaign.subject) {
      setError('Preencha o nome e assunto da campanha');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const data = {
        ...campaign,
        status: asDraft ? 'draft' : campaign.status
      };

      if (isEditing) {
        const result = await updateCampaign(id, data);
        if (result.isMock) {
          showInfo('Modo de demonstracao: alteracoes simuladas.');
        }
      } else {
        const result = await createCampaign(data);
        if (result.isMock) {
          showInfo('Modo de demonstracao: campanha simulada.');
        }
        if (result.id) {
          navigate(`/newsletter/campaigns/${result.id}`, { replace: true });
        }
      }
    } catch (err) {
      console.error('Error saving campaign:', err);
      setError('Erro ao guardar campanha');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!campaign.listIds || campaign.listIds.length === 0) {
      setError('Selecione pelo menos uma lista de destinatarios');
      return;
    }

    if (!window.confirm('Tem certeza que deseja enviar esta campanha agora?')) return;

    try {
      const result = await sendCampaign(id || 'new');
      if (result.isMock) {
        showInfo(
          'Modo de demonstracao: Para enviar campanhas reais, configure as credenciais do Brevo.'
        );
      } else {
        showSuccess('Campanha enviada com sucesso!');
        navigate('/newsletter/campaigns');
      }
    } catch (err) {
      console.error('Error sending campaign:', err);
      setError('Erro ao enviar campanha');
    }
  };

  const handleSchedule = async () => {
    if (!scheduleDate) {
      showError('Selecione uma data e hora');
      return;
    }

    try {
      const result = await scheduleCampaign(id || 'new', scheduleDate);
      if (result.isMock) {
        showInfo('Modo de demonstracao: agendamento simulado.');
      } else {
        showSuccess('Campanha agendada com sucesso!');
      }
      setShowScheduleModal(false);
    } catch (err) {
      console.error('Error scheduling campaign:', err);
      setError('Erro ao agendar campanha');
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      showError('Insira um email para teste');
      return;
    }

    try {
      const result = await sendTestEmail(id || 'new', testEmail);
      if (result.isMock) {
        showInfo(
          'Modo de demonstracao: Para enviar emails de teste, configure as credenciais do Brevo.'
        );
      } else {
        showSuccess('Email de teste enviado!');
      }
      setShowTestModal(false);
    } catch (err) {
      console.error('Error sending test:', err);
      showError('Erro ao enviar email de teste');
    }
  };

  const addBlock = (type) => {
    const newBlock = {
      id: `${type}-${Date.now()}`,
      type,
      content: getDefaultBlockContent(type)
    };

    setCampaign((c) => ({
      ...c,
      blocks: [...c.blocks, newBlock]
    }));
    setShowBlockPicker(false);
    setSelectedBlock(newBlock.id);
  };

  const updateBlock = (blockId, content) => {
    setCampaign((c) => ({
      ...c,
      blocks: c.blocks.map((b) =>
        b.id === blockId ? { ...b, content: { ...b.content, ...content } } : b
      )
    }));
  };

  const removeBlock = (blockId) => {
    setCampaign((c) => ({
      ...c,
      blocks: c.blocks.filter((b) => b.id !== blockId)
    }));
    setSelectedBlock(null);
  };

  const moveBlock = (blockId, direction) => {
    const index = campaign.blocks.findIndex((b) => b.id === blockId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === campaign.blocks.length - 1)
    )
      return;

    const newBlocks = [...campaign.blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];

    setCampaign((c) => ({ ...c, blocks: newBlocks }));
  };

  const renderBlockEditor = (block) => {
    const isSelected = selectedBlock === block.id;

    return (
      <div
        key={block.id}
        className={`relative border-2 rounded-lg mb-2 transition-colors ${
          isSelected ? 'border-brand' : 'border-transparent hover:border-gray-200'
        }`}
        onClick={() => setSelectedBlock(block.id)}
      >
        {/* Block Controls - Hidden on mobile, visible on larger screens */}
        <div
          className={`hidden sm:flex absolute -left-10 top-1/2 -translate-y-1/2 flex-col gap-1 ${isSelected ? '' : 'opacity-0 group-hover:opacity-100'}`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveBlock(block.id, 'up');
            }}
            className="p-1 bg-white border rounded hover:bg-gray-50"
            title="Mover para cima"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveBlock(block.id, 'down');
            }}
            className="p-1 bg-white border rounded hover:bg-gray-50"
            title="Mover para baixo"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Mobile Block Controls - Inside the block */}
        {isSelected && (
          <div className="sm:hidden absolute top-2 left-2 flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveBlock(block.id, 'up');
              }}
              className="p-1.5 bg-white border rounded shadow-sm hover:bg-gray-50"
              title="Mover para cima"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveBlock(block.id, 'down');
              }}
              className="p-1.5 bg-white border rounded shadow-sm hover:bg-gray-50"
              title="Mover para baixo"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        )}

        {/* Block Preview */}
        <div className="p-4">{renderBlockPreview(block)}</div>

        {/* Delete Button */}
        {isSelected && block.type !== 'header' && block.type !== 'footer' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeBlock(block.id);
            }}
            className="absolute -right-2 -top-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            title="Remover bloco"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    );
  };

  const renderBlockPreview = (block) => {
    switch (block.type) {
      case 'header':
        return (
          <div className="bg-brand text-white p-4 rounded text-center">
            <h2 className="font-bold text-lg">{block.content.siteName || 'O Investigador'}</h2>
            <p className="text-sm opacity-80">{block.content.tagline || 'Jornal Online'}</p>
          </div>
        );

      case 'hero':
        return (
          <div className="bg-gray-100 p-4 rounded">
            {block.content.category && (
              <span className="text-xs bg-brand text-white px-2 py-1 rounded">
                {block.content.category}
              </span>
            )}
            <h2 className="font-bold text-xl mt-2">
              {block.content.title || 'Titulo do destaque principal'}
            </h2>
            <p className="text-gray-600 mt-2">
              {block.content.excerpt || 'Resumo da noticia em destaque...'}
            </p>
            {block.content.imageUrl && (
              <div className="mt-3 bg-gray-200 h-40 rounded flex items-center justify-center">
                <Image className="text-gray-400" size={32} />
              </div>
            )}
          </div>
        );

      case 'article':
        return (
          <div className="flex gap-4 p-3 border rounded">
            <div className="w-24 h-20 bg-gray-200 rounded flex items-center justify-center shrink-0">
              <Image className="text-gray-400" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{block.content.title || 'Titulo do artigo'}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {block.content.excerpt || 'Breve descricao do artigo...'}
              </p>
            </div>
          </div>
        );

      case 'article-list':
        return (
          <div className="border rounded p-3">
            <h3 className="font-medium mb-2">Lista de Artigos</h3>
            <ul className="space-y-2">
              {(block.content.articles || []).map((article, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <span className="w-1 h-1 bg-brand rounded-full"></span>
                  {article.title || 'Titulo do artigo'}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'text':
        return (
          <p className="text-gray-700">
            {block.content.content || 'Clique para editar o texto...'}
          </p>
        );

      case 'image':
        return (
          <div className="text-center">
            <div className="bg-gray-200 h-32 rounded flex items-center justify-center">
              {block.content.url ? (
                <img src={block.content.url} alt={block.content.alt} className="max-h-full" />
              ) : (
                <Image className="text-gray-400" size={32} />
              )}
            </div>
            {block.content.caption && (
              <p className="text-sm text-gray-500 mt-1">{block.content.caption}</p>
            )}
          </div>
        );

      case 'button':
        return (
          <div className="text-center">
            <button
              className={`px-6 py-2 rounded font-medium ${
                block.content.style === 'primary'
                  ? 'bg-brand text-white'
                  : 'border border-brand text-brand'
              }`}
            >
              {block.content.text || 'Ler Mais'}
            </button>
          </div>
        );

      case 'divider':
        return (
          <hr
            className={`border-t ${
              block.content.style === 'dashed' ? 'border-dashed' : ''
            } border-gray-300`}
          />
        );

      case 'quote':
        return (
          <blockquote className="border-l-4 border-brand pl-4 italic text-gray-600">
            "{block.content.text || 'Texto da citacao...'}"
            {block.content.author && (
              <p className="text-sm text-gray-500 mt-1 not-italic">— {block.content.author}</p>
            )}
          </blockquote>
        );

      case 'footer':
        return (
          <div className="bg-gray-800 text-white p-4 rounded text-center text-sm">
            <p>{block.content.copyright || '2026 O Investigador'}</p>
            <p className="text-gray-400 mt-1 text-xs">
              <a href="#" className="underline">
                {block.content.unsubscribeText || 'Cancelar subscricao'}
              </a>
            </p>
          </div>
        );

      default:
        return <p className="text-gray-500">Bloco desconhecido</p>;
    }
  };

  const renderBlockProperties = () => {
    const block = campaign.blocks.find((b) => b.id === selectedBlock);
    if (!block) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          {BLOCK_TYPES.find((t) => t.type === block.type)?.label || 'Bloco'}
        </h3>

        {/* Different editors based on block type */}
        {block.type === 'header' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Site</label>
              <input
                type="text"
                value={block.content.siteName || ''}
                onChange={(e) => updateBlock(block.id, { siteName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={block.content.tagline || ''}
                onChange={(e) => updateBlock(block.id, { tagline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
              />
            </div>
          </>
        )}

        {(block.type === 'hero' || block.type === 'article') && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titulo</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumo</label>
              <textarea
                value={block.content.excerpt || ''}
                onChange={(e) => updateBlock(block.id, { excerpt: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
              <input
                type="url"
                value={block.content.imageUrl || ''}
                onChange={(e) => updateBlock(block.id, { imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
              <input
                type="url"
                value={block.content.link || ''}
                onChange={(e) => updateBlock(block.id, { link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
                placeholder="https://..."
              />
            </div>
            {block.type === 'hero' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <input
                  type="text"
                  value={block.content.category || ''}
                  onChange={(e) => updateBlock(block.id, { category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
                />
              </div>
            )}
          </>
        )}

        {block.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conteudo</label>
            <textarea
              value={block.content.content || ''}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
            />
          </div>
        )}

        {block.type === 'button' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Botao</label>
              <input
                type="text"
                value={block.content.text || ''}
                onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de Destino</label>
              <input
                type="url"
                value={block.content.url || ''}
                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estilo</label>
              <select
                value={block.content.style || 'primary'}
                onChange={(e) => updateBlock(block.id, { style: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
              >
                <option value="primary">Primario (preenchido)</option>
                <option value="outline">Outline (contorno)</option>
              </select>
            </div>
          </>
        )}

        {block.type === 'quote' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Citacao</label>
              <textarea
                value={block.content.text || ''}
                onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
              <input
                type="text"
                value={block.content.author || ''}
                onChange={(e) => updateBlock(block.id, { author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
              />
            </div>
          </>
        )}

        {block.type === 'footer' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Copyright</label>
              <input
                type="text"
                value={block.content.copyright || ''}
                onChange={(e) => updateBlock(block.id, { copyright: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texto de Cancelamento
              </label>
              <input
                type="text"
                value={block.content.unsubscribeText || ''}
                onChange={(e) => updateBlock(block.id, { unsubscribeText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
              />
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 -m-4 sm:-m-6 lg:-m-8">
      {/* Top Bar */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Link to="/newsletter/campaigns" className="text-gray-400 hover:text-gray-600 shrink-0">
              <ChevronLeft size={24} />
            </Link>
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={campaign.name}
                onChange={(e) => setCampaign((c) => ({ ...c, name: e.target.value }))}
                placeholder="Nome da campanha"
                className="font-semibold text-base sm:text-lg border-none focus:ring-0 p-0 w-full max-w-[200px] sm:max-w-xs lg:max-w-md truncate"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTestModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm"
            >
              <TestTube size={16} />
              <span className="hidden sm:inline">Testar</span>
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
            >
              <Save size={16} />
              <span className="hidden sm:inline">{saving ? 'A guardar...' : 'Guardar'}</span>
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
            >
              <Clock size={16} />
              <span className="hidden sm:inline">Agendar</span>
            </button>
            <button
              onClick={handleSend}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded hover:bg-brand-light text-sm"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t px-4">
          {[
            { id: 'content', label: 'Conteudo', icon: FileText },
            { id: 'settings', label: 'Configuracoes', icon: Settings },
            { id: 'preview', label: 'Preview', icon: Eye }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700">
          <AlertCircle size={18} />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Mock Warning */}
      {isMock && (
        <div className="mx-4 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-center gap-2 text-sm">
          <AlertCircle className="text-yellow-600 shrink-0" size={16} />
          <span className="text-yellow-700">
            Modo de demonstracao - o envio real requer configuracao do Brevo.
          </span>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="flex flex-col lg:flex-row gap-4 p-3 sm:p-4">
          {/* Editor Area */}
          <div className="flex-1 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 max-w-2xl mx-auto">
              {/* Subject Line */}
              <div className="mb-6 pb-4 border-b">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assunto do Email
                </label>
                <input
                  type="text"
                  value={campaign.subject}
                  onChange={(e) => setCampaign((c) => ({ ...c, subject: e.target.value }))}
                  placeholder="Escreva um assunto apelativo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand"
                />
                <input
                  type="text"
                  value={campaign.preheader || ''}
                  onChange={(e) => setCampaign((c) => ({ ...c, preheader: e.target.value }))}
                  placeholder="Texto de pre-visualizacao (opcional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand mt-2 text-sm"
                />
              </div>

              {/* Blocks */}
              <div className="space-y-2 group">
                {campaign.blocks.map((block) => renderBlockEditor(block))}
              </div>

              {/* Add Block Button */}
              <button
                onClick={() => setShowBlockPicker(true)}
                className="w-full mt-4 py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand hover:text-brand transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Adicionar Bloco
              </button>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-full lg:w-80 shrink-0 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow p-4 lg:sticky lg:top-36">
              <h3 className="font-medium mb-4 text-sm text-gray-500 uppercase tracking-wide">
                Propriedades
              </h3>
              {selectedBlock ? (
                renderBlockProperties()
              ) : (
                <p className="text-gray-400 text-sm text-center py-4 lg:py-8">
                  Selecione um bloco para editar
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="p-4 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h3 className="font-medium mb-4">Remetente</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Remetente
                  </label>
                  <input
                    type="text"
                    value={campaign.senderName || ''}
                    onChange={(e) => setCampaign((c) => ({ ...c, senderName: e.target.value }))}
                    placeholder="O Investigador"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email do Remetente
                  </label>
                  <input
                    type="email"
                    value={campaign.senderEmail || ''}
                    onChange={(e) => setCampaign((c) => ({ ...c, senderEmail: e.target.value }))}
                    placeholder="newsletter@jornalinvestigador.pt"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responder Para
                </label>
                <input
                  type="email"
                  value={campaign.replyTo || ''}
                  onChange={(e) => setCampaign((c) => ({ ...c, replyTo: e.target.value }))}
                  placeholder="redacao@jornalinvestigador.pt"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand"
                />
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Destinatarios</h3>
              <div className="space-y-2">
                {lists.map((list) => (
                  <label
                    key={list.id}
                    className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={campaign.listIds?.includes(list.id) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCampaign((c) => ({
                            ...c,
                            listIds: [...(c.listIds || []), list.id]
                          }));
                        } else {
                          setCampaign((c) => ({
                            ...c,
                            listIds: (c.listIds || []).filter((id) => id !== list.id)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-brand focus:ring-brand"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{list.name}</p>
                      <p className="text-sm text-gray-500">{list.subscribers} subscritores</p>
                    </div>
                    <Users className="text-gray-400" size={18} />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="p-4">
          {/* Preview Controls */}
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`flex items-center gap-2 px-4 py-2 rounded ${
                previewMode === 'desktop' ? 'bg-brand text-white' : 'bg-white border'
              }`}
            >
              <Monitor size={18} />
              Desktop
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`flex items-center gap-2 px-4 py-2 rounded ${
                previewMode === 'mobile' ? 'bg-brand text-white' : 'bg-white border'
              }`}
            >
              <Smartphone size={18} />
              Mobile
            </button>
          </div>

          {/* Professional Email Preview */}
          <div className={`mx-auto ${previewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'}`}>
            <EmailPreview campaign={campaign} previewMode={previewMode} />
          </div>
        </div>
      )}

      {/* Block Picker Modal */}
      {showBlockPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Adicionar Bloco</h2>
              <button
                onClick={() => setShowBlockPicker(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {BLOCK_TYPES.map((blockType) => (
                <button
                  key={blockType.type}
                  onClick={() => addBlock(blockType.type)}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:border-brand hover:bg-brand/5 text-left transition-colors"
                >
                  <blockType.icon className="text-brand shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-sm">{blockType.label}</p>
                    <p className="text-xs text-gray-500">{blockType.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Agendar Envio</h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand"
                />
              </div>
              <p className="text-sm text-gray-500">
                <Clock size={14} className="inline mr-1" />A campanha sera enviada automaticamente
                na data e hora selecionadas.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSchedule}
                  className="flex-1 px-4 py-2 bg-brand text-white rounded hover:bg-brand-light"
                >
                  Agendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Enviar Email de Teste</h2>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Destino
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="seu.email@exemplo.pt"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand"
                />
              </div>
              <p className="text-sm text-gray-500">
                Envie um email de teste para verificar a aparencia da newsletter.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTestModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendTest}
                  className="flex-1 px-4 py-2 bg-brand text-white rounded hover:bg-brand-light"
                >
                  Enviar Teste
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignEditor;

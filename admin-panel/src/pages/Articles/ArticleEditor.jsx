import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  createArticle,
  getArticle,
  updateArticle,
  getTags,
  ARTICLE_TYPES
} from '../../services/articles';
import { convertToHtml, htmlToEditorJs, generateSlug } from '../../utils/editorJsToHtml';
import MediaLibrary from '../Media/MediaLibrary';
import RevisionHistory from '../../components/RevisionHistory';
import {
  Image as ImageIcon,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  Send,
  RefreshCw,
  Calendar,
  Eye,
  Tag,
  Plus,
  Type,
  Bold,
  Italic,
  List as ListIcon,
  ListOrdered,
  Quote as QuoteIcon,
  Code as CodeIcon,
  Table as TableIcon,
  Minus,
  HelpCircle,
  FileText,
  History
} from 'lucide-react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Embed from '@editorjs/embed';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import Table from '@editorjs/table';
import Delimiter from '@editorjs/delimiter';
import api from '../../services/api';

const ArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    feature_image: '',
    status: 'draft',
    visibility: 'public',
    published_at: '',
    meta_title: '',
    meta_description: '',
    tags: [],
    article_type: ''
  });

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagSearch, setTagSearch] = useState('');
  const [editorData, setEditorData] = useState(null);
  const [editorReady, setEditorReady] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showEditorHelp, setShowEditorHelp] = useState(false);
  const [showInlineImagePicker, setShowInlineImagePicker] = useState(false);
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!isEditing); // Auto-slug enabled by default for new articles

  // Insert block into Editor.js
  const insertBlock = async (type, data = {}) => {
    if (!editorInstanceRef.current || !editorReady) {
      setError('Editor ainda carregando. Aguarde um momento.');
      return;
    }

    try {
      const editor = editorInstanceRef.current;

      switch (type) {
        case 'header':
          await editor.blocks.insert('header', { text: '', level: 2 });
          break;
        case 'list':
          await editor.blocks.insert('list', { style: 'unordered', items: [''] });
          break;
        case 'orderedList':
          await editor.blocks.insert('list', { style: 'ordered', items: [''] });
          break;
        case 'quote':
          await editor.blocks.insert('quote', { text: '', caption: '' });
          break;
        case 'code':
          await editor.blocks.insert('code', { code: '' });
          break;
        case 'table':
          await editor.blocks.insert('table', {
            withHeadings: true,
            content: [
              ['', ''],
              ['', '']
            ]
          });
          break;
        case 'delimiter':
          await editor.blocks.insert('delimiter', {});
          break;
        case 'image':
          // Open inline image picker
          setShowInlineImagePicker(true);
          break;
        default:
          break;
      }

      // Focus the editor after insertion
      if (type !== 'image') {
        const lastBlockIndex = (await editor.save()).blocks.length - 1;
        editor.caret.setToBlock(lastBlockIndex, 'end');
      }
    } catch (err) {
      console.error('Failed to insert block:', err);
    }
  };

  // Handle inline image selection from media library
  const handleInlineImageSelect = async (item) => {
    setShowInlineImagePicker(false);
    if (editorInstanceRef.current && editorReady) {
      try {
        await editorInstanceRef.current.blocks.insert('image', {
          file: { url: item.url },
          caption: item.alt || '',
          withBorder: false,
          withBackground: false,
          stretched: false
        });
      } catch (err) {
        console.error('Failed to insert image:', err);
      }
    }
  };

  // Initialize Editor.js - reinitialize when editorData changes for editing
  useEffect(() => {
    // Skip if no ref
    if (!editorRef.current) return;

    // For editing: wait for editorData before initializing
    // For new articles: initialize immediately
    if (isEditing && !editorData) {
      return;
    }

    // Destroy existing editor if any
    if (editorInstanceRef.current) {
      editorInstanceRef.current.destroy();
      editorInstanceRef.current = null;
      setEditorReady(false);
    }

    const initEditor = async () => {
      const editor = new EditorJS({
        holder: editorRef.current,
        placeholder: 'Comece a escrever seu artigo...',
        autofocus: false,
        data: editorData || undefined,
        tools: {
          header: {
            class: Header,
            config: {
              placeholder: 'Titulo da secao',
              levels: [2, 3, 4],
              defaultLevel: 2
            }
          },
          list: {
            class: List,
            inlineToolbar: true
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile: async (file) => {
                  try {
                    // Validar tamanho do arquivo (max 10MB)
                    const maxSize = 10 * 1024 * 1024;
                    if (file.size > maxSize) {
                      setError('Imagem muito grande. Maximo permitido: 10MB');
                      return { success: 0 };
                    }

                    // Validar tipo do arquivo
                    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                    if (!allowedTypes.includes(file.type)) {
                      setError('Tipo de arquivo nao permitido. Use: JPG, PNG, GIF ou WebP');
                      return { success: 0 };
                    }

                    const uploadData = new FormData();
                    uploadData.append('file', file);
                    const response = await api.post('/api/media/upload', uploadData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    return { success: 1, file: { url: response.data.url } };
                  } catch (err) {
                    console.error('Image upload failed:', err);
                    const errorMsg = err.response?.data?.error || 'Falha ao enviar imagem';
                    setError(`Erro no upload: ${errorMsg}`);
                    return { success: 0 };
                  }
                },
                uploadByUrl: async (url) => {
                  // Validar URL basica
                  if (!url || !url.startsWith('http')) {
                    setError('URL de imagem invalida');
                    return { success: 0 };
                  }
                  return { success: 1, file: { url } };
                }
              }
            }
          },
          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                twitter: true,
                instagram: true,
                vimeo: true
              }
            }
          },
          quote: {
            class: Quote,
            inlineToolbar: true
          },
          code: Code,
          table: {
            class: Table,
            inlineToolbar: true
          },
          delimiter: Delimiter
        },
        onReady: () => {
          setEditorReady(true);
        }
      });

      editorInstanceRef.current = editor;
    };

    initEditor();

    return () => {
      if (editorInstanceRef.current && editorInstanceRef.current.destroy) {
        editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
      }
    };
  }, [editorData, isEditing]); // Re-initialize when editorData changes

  // Load article if editing
  useEffect(() => {
    if (isEditing) fetchArticle();
    fetchTags();
  }, [id]);

  // Traduzir erros comuns do Ghost CMS para português
  const translateGhostError = (error) => {
    const errorMap = {
      'Ghost API is not configured':
        'API do Ghost nao esta configurada. Verifique as variaveis de ambiente.',
      'Title is required': 'O titulo e obrigatorio.',
      'not found': 'Artigo nao encontrado. Pode ter sido deletado.',
      'Validation failed': 'Validacao falhou. Verifique os campos preenchidos.',
      Unauthorized: 'Sessao expirada. Faca login novamente.',
      'Network Error': 'Erro de conexao. Verifique sua internet.',
      ECONNREFUSED: 'Servidor indisponivel. Tente novamente mais tarde.',
      slug: 'O slug ja esta em uso por outro artigo.',
      UpdateCollisionError: 'Conflito de atualizacao. O artigo foi modificado por outro usuario.',
      'Request failed': 'Falha na requisicao. Verifique os dados e tente novamente.',
      timeout: 'Tempo limite excedido. Tente novamente.',
      html: 'Conteudo HTML invalido.',
      feature_image: 'URL da imagem destacada invalida.',
      published_at: 'Data de publicacao invalida.',
      visibility: 'Configuracao de visibilidade invalida.'
    };

    for (const [key, translation] of Object.entries(errorMap)) {
      if (error.toLowerCase().includes(key.toLowerCase())) {
        return translation;
      }
    }

    return `Erro ao salvar: ${error}`;
  };

  const fetchArticle = async () => {
    try {
      const data = await getArticle(id);
      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        feature_image: data.feature_image || '',
        status: data.status || 'draft',
        visibility: data.visibility || 'public',
        published_at: data.published_at ? data.published_at.slice(0, 16) : '',
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        tags: data.tags || [],
        article_type: data.article_type || ''
      });

      // Convert HTML to Editor.js format
      if (data.html) {
        // Fix mixed content: convert http:// URLs to https://
        const fixedHtml = data.html.replace(
          /http:\/\/api\.jornalinvestigador\.pt/g,
          'https://api.jornalinvestigador.pt'
        );
        const blocks = htmlToEditorJs(fixedHtml);

        if (blocks && blocks.blocks && blocks.blocks.length > 0) {
          setEditorData(blocks);
        } else {
          // Fallback: create a simple paragraph block with the HTML content
          const textContent = fixedHtml
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          setEditorData({
            time: Date.now(),
            blocks: [
              {
                type: 'paragraph',
                data: { text: textContent || 'Conteudo vazio' }
              }
            ],
            version: '2.28.0'
          });
        }
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Erro desconhecido';
      setError(translateGhostError(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const tags = await getTags();
      setAvailableTags(tags);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      // Auto-update slug if autoSlug is enabled OR if slug is empty
      slug: autoSlug ? generateSlug(title) : prev.slug || generateSlug(title)
    }));
  };

  const handleSlugChange = (e) => {
    const value = e.target.value;
    // When user manually edits slug, disable auto-slug
    setAutoSlug(false);
    // Apply slug formatting in real-time
    const formattedSlug = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Spaces to hyphens
      .replace(/-+/g, '-'); // Multiple hyphens to single
    setFormData((prev) => ({ ...prev, slug: formattedSlug }));
  };

  const generateNewSlug = () => {
    setFormData((prev) => ({
      ...prev,
      slug: generateSlug(prev.title)
    }));
  };

  const toggleAutoSlug = () => {
    const newAutoSlug = !autoSlug;
    setAutoSlug(newAutoSlug);
    // If enabling auto-slug, immediately update slug from title
    if (newAutoSlug && formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(prev.title)
      }));
    }
  };

  const handleMediaSelect = (item) => {
    setFormData((prev) => ({ ...prev, feature_image: item.url }));
    setShowMediaPicker(false);
  };

  const addTag = (tag) => {
    if (!formData.tags.find((t) => t.id === tag.id || t.name === tag.name)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setTagSearch('');
  };

  const createTag = () => {
    if (tagSearch.trim()) {
      addTag({ name: tagSearch.trim() });
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t.id !== tagToRemove.id && t.name !== tagToRemove.name)
    }));
  };

  const filteredTags = availableTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !formData.tags.find((t) => t.id === tag.id)
  );

  const handlePreview = async () => {
    try {
      let html = '';
      if (editorInstanceRef.current) {
        const outputData = await editorInstanceRef.current.save();
        html = convertToHtml(outputData);
      }
      setPreviewHtml(html);
      setShowPreview(true);
    } catch (err) {
      console.error('Preview error:', err);
    }
  };

  const handleSubmit = async (targetStatus) => {
    setError('');

    // Validacoes no frontend antes de enviar
    if (!formData.title || formData.title.trim() === '') {
      setError('O titulo e obrigatorio.');
      return;
    }

    if (formData.title.length > 255) {
      setError('O titulo deve ter no maximo 255 caracteres.');
      return;
    }

    if (targetStatus === 'scheduled' && !formData.published_at) {
      setError('Posts agendados precisam de uma data de publicacao.');
      return;
    }

    setSaving(true);

    try {
      // Get editor content
      let html = '';
      if (editorInstanceRef.current) {
        const outputData = await editorInstanceRef.current.save();
        html = convertToHtml(outputData);
      }

      // Validar se tem conteudo
      const textContent = html.replace(/<[^>]*>/g, '').trim();
      if (!textContent && !formData.feature_image) {
        setError('Adicione algum conteudo ao artigo antes de salvar.');
        setSaving(false);
        return;
      }

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug || undefined,
        html,
        custom_excerpt: formData.excerpt,
        feature_image: formData.feature_image || null,
        status: targetStatus || formData.status,
        visibility: formData.visibility,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        tags: formData.tags.map((t) => t.name || t),
        article_type: formData.article_type || undefined
      };

      // Handle scheduled posts
      if (payload.status === 'scheduled' && formData.published_at) {
        payload.published_at = new Date(formData.published_at).toISOString();
      }

      if (isEditing) {
        await updateArticle(id, payload);
      } else {
        await createArticle(payload);
      }

      setSaving(false);
      navigate('/articles');
    } catch (err) {
      console.error('Save error:', err);
      // Extrair mensagem de erro detalhada do backend
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Erro desconhecido ao salvar artigo';

      // Traduzir erros comuns do Ghost para português
      const translatedError = translateGhostError(errorMessage);
      setError(translatedError);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-7xl mx-auto">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 order-2 lg:order-1">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg mb-4 overflow-hidden">
            <div className="bg-red-100 px-4 py-2 flex items-center justify-between">
              <span className="font-medium text-red-800">Erro ao salvar artigo</span>
              <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
                <X size={16} />
              </button>
            </div>
            <div className="px-4 py-3">
              <p className="text-red-700 text-sm">{error}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmit(formData.status)}
                  className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Tentar novamente
                </button>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="text-xs px-3 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50"
                >
                  Ignorar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Title */}
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Titulo do artigo"
            className="w-full text-xl sm:text-2xl lg:text-3xl font-bold border-0 border-b border-transparent focus:border-gray-300 focus:ring-0 px-0 py-2 placeholder-gray-400"
          />

          {/* Slug */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Slug:</span>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleSlugChange}
                disabled={autoSlug}
                className={`flex-1 border-0 border-b focus:ring-0 px-0 py-1 ${
                  autoSlug
                    ? 'border-gray-100 text-gray-400 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-200 focus:border-brand text-gray-700'
                }`}
                placeholder="url-do-artigo"
              />
              <button
                type="button"
                onClick={generateNewSlug}
                className={`p-1 transition-colors ${
                  autoSlug ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-brand'
                }`}
                title="Regenerar slug do titulo"
                disabled={autoSlug}
              >
                <RefreshCw size={14} />
              </button>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSlug}
                onChange={toggleAutoSlug}
                className="rounded border-gray-300 text-brand focus:ring-brand h-3.5 w-3.5"
              />
              <span>Auto-preencher slug a partir do titulo</span>
            </label>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagem Destacada</label>
            {formData.feature_image ? (
              <div className="relative inline-block">
                <img
                  src={formData.feature_image}
                  alt="Featured"
                  className="max-h-48 rounded-lg border object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, feature_image: '' }))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="flex items-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand hover:text-brand transition-colors w-full justify-center"
              >
                <ImageIcon size={20} />
                <span>Adicionar imagem destacada</span>
              </button>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resumo</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={2}
              placeholder="Breve descricao do artigo (aparece nas listagens)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand text-sm"
            />
          </div>

          {/* Editor.js Container */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Conteudo</label>
              <button
                type="button"
                onClick={() => setShowEditorHelp(!showEditorHelp)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand"
              >
                <HelpCircle size={14} />
                Como usar o editor
              </button>
            </div>

            {/* Toolbar Funcional - Estilo WordPress */}
            <div className="bg-gray-50 border border-gray-200 rounded-t-lg p-2 flex items-center gap-1 flex-wrap overflow-x-auto">
              <div className="flex items-center gap-1 pr-2 border-r border-gray-300 shrink-0">
                <span className="text-xs text-gray-500 mr-1 hidden sm:inline">Blocos:</span>
                <button
                  type="button"
                  onClick={() => insertBlock('header')}
                  className="p-1.5 text-gray-600 hover:bg-white hover:text-brand rounded transition-colors"
                  title="Inserir Titulo (H2)"
                >
                  <Type size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock('list')}
                  className="p-1.5 text-gray-600 hover:bg-white hover:text-brand rounded transition-colors"
                  title="Inserir Lista"
                >
                  <ListIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock('orderedList')}
                  className="p-1.5 text-gray-600 hover:bg-white hover:text-brand rounded transition-colors"
                  title="Inserir Lista Numerada"
                >
                  <ListOrdered size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock('quote')}
                  className="p-1.5 text-gray-600 hover:bg-white hover:text-brand rounded transition-colors"
                  title="Inserir Citacao"
                >
                  <QuoteIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock('code')}
                  className="p-1.5 text-gray-600 hover:bg-white hover:text-brand rounded transition-colors"
                  title="Inserir Bloco de Codigo"
                >
                  <CodeIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock('table')}
                  className="p-1.5 text-gray-600 hover:bg-white hover:text-brand rounded transition-colors"
                  title="Inserir Tabela"
                >
                  <TableIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock('image')}
                  className="p-1.5 text-gray-600 hover:bg-white hover:text-brand rounded transition-colors"
                  title="Inserir Imagem"
                >
                  <ImageIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock('delimiter')}
                  className="p-1.5 text-gray-600 hover:bg-white hover:text-brand rounded transition-colors"
                  title="Inserir Separador"
                >
                  <Minus size={16} />
                </button>
              </div>
              <div className="flex items-center gap-1 pl-2 shrink-0">
                <span className="text-xs text-gray-500 mr-1 hidden sm:inline">Texto:</span>
                <button
                  type="button"
                  className="p-1.5 text-gray-600 hover:bg-white hover:text-brand rounded transition-colors cursor-help"
                  title="Negrito: Selecione texto e pressione Ctrl+B"
                >
                  <Bold size={16} />
                </button>
                <button
                  type="button"
                  className="p-1.5 text-gray-600 hover:bg-white hover:text-brand rounded transition-colors cursor-help"
                  title="Italico: Selecione texto e pressione Ctrl+I"
                >
                  <Italic size={16} />
                </button>
              </div>
            </div>

            {/* Dicas do Editor */}
            {showEditorHelp && (
              <div className="bg-blue-50 border-x border-gray-200 p-3 text-sm text-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">Guia Rapido - Editor de Blocos</h4>
                  <button
                    onClick={() => setShowEditorHelp(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-800 mb-1">Adicionar Blocos:</p>
                    <ul className="text-xs space-y-1 text-gray-600">
                      <li>• Clique em qualquer linha vazia</li>
                      <li>
                        • Aparecera um <strong>+</strong> no lado esquerdo
                      </li>
                      <li>
                        • Clique no <strong>+</strong> para ver os tipos de bloco
                      </li>
                      <li>
                        • Ou digite <strong>/</strong> para buscar blocos
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 mb-1">Formatar Texto:</p>
                    <ul className="text-xs space-y-1 text-gray-600">
                      <li>
                        • <strong>Selecione o texto</strong> para ver opcoes
                      </li>
                      <li>
                        • <kbd className="px-1 bg-gray-200 rounded">Ctrl+B</kbd> = Negrito
                      </li>
                      <li>
                        • <kbd className="px-1 bg-gray-200 rounded">Ctrl+I</kbd> = Italico
                      </li>
                      <li>
                        • <kbd className="px-1 bg-gray-200 rounded">Ctrl+K</kbd> = Link
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div
              ref={editorRef}
              className="prose max-w-none border border-gray-200 border-t-0 rounded-b-lg p-4 min-h-[400px] focus-within:border-brand bg-white"
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-4 order-1 lg:order-2">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium text-gray-900 mb-3">Publicacao</h3>

          {/* Status */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="scheduled">Agendado</option>
            </select>
          </div>

          {/* Scheduled Date */}
          {formData.status === 'scheduled' && (
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1 flex items-center gap-1">
                <Calendar size={14} /> Data de publicacao
              </label>
              <input
                type="datetime-local"
                name="published_at"
                value={formData.published_at}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
              />
            </div>
          )}

          {/* Visibility */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Visibilidade</label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
            >
              <option value="public">Publico</option>
              <option value="members">Apenas membros</option>
              <option value="paid">Apenas assinantes</option>
            </select>
          </div>

          {/* Article Type */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1 flex items-center gap-1">
              <FileText size={14} /> Tipo de Artigo
            </label>
            <select
              name="article_type"
              value={formData.article_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
            >
              <option value="">Selecionar tipo...</option>
              <option value="cronica">Cronica</option>
              <option value="reportagem">Reportagem</option>
              <option value="opiniao">Opiniao</option>
            </select>
            {formData.article_type && (
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    formData.article_type === 'cronica'
                      ? 'bg-purple-100 text-purple-800'
                      : formData.article_type === 'reportagem'
                        ? 'bg-blue-100 text-blue-800'
                        : formData.article_type === 'opiniao'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {ARTICLE_TYPES[formData.article_type]?.label || formData.article_type}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={handlePreview}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              <Eye size={16} />
              Preview
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => setShowRevisionHistory(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                <History size={16} />
                Historico
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Save size={16} />
              Salvar Rascunho
            </button>
            <button
              type="button"
              onClick={() =>
                handleSubmit(formData.status === 'scheduled' ? 'scheduled' : 'published')
              }
              disabled={saving}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded hover:bg-brand-light disabled:opacity-50"
            >
              <Send size={16} />
              {formData.status === 'scheduled' ? 'Agendar' : 'Publicar'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/articles')}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* Tags Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Tag size={16} /> Tags
          </h3>

          {/* Selected Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {formData.tags.map((tag, idx) => (
              <span
                key={tag.id || idx}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          {/* Tag Search */}
          <div className="relative">
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Buscar ou criar tag..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
            />

            {tagSearch && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    {tag.name}
                  </button>
                ))}
                {tagSearch &&
                  !filteredTags.find((t) => t.name.toLowerCase() === tagSearch.toLowerCase()) && (
                    <button
                      type="button"
                      onClick={createTag}
                      className="w-full px-3 py-2 text-left text-sm text-brand hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Plus size={14} /> Criar "{tagSearch}"
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* SEO Card */}
        <div className="bg-white rounded-lg shadow">
          <button
            type="button"
            onClick={() => setShowSeoPanel(!showSeoPanel)}
            className="w-full px-4 py-3 flex items-center justify-between text-left"
          >
            <h3 className="font-medium text-gray-900">SEO</h3>
            {showSeoPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showSeoPanel && (
            <div className="px-4 pb-4 space-y-4 border-t">
              <div className="pt-4">
                <label className="block text-sm text-gray-600 mb-1">
                  Meta Titulo
                  <span
                    className={`ml-2 ${formData.meta_title.length > 60 ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    {formData.meta_title.length}/60
                  </span>
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  placeholder={formData.title || 'Titulo para buscadores'}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Meta Descricao
                  <span
                    className={`ml-2 ${formData.meta_description.length > 160 ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    {formData.meta_description.length}/160
                  </span>
                </label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Descricao para buscadores..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
                />
              </div>

              {/* SEO Preview */}
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm font-medium text-blue-600 truncate">
                  {formData.meta_title || formData.title || 'Titulo do artigo'}
                </p>
                <p className="text-xs text-green-700 truncate">
                  seusite.com/{formData.slug || 'slug-do-artigo'}
                </p>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {formData.meta_description ||
                    formData.excerpt ||
                    'Descricao do artigo aparecera aqui...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowMediaPicker(false)}
        >
          <div
            className="bg-gray-100 rounded-xl w-full max-w-5xl max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Selecionar da Biblioteca de Midias</h2>
              <button
                onClick={() => setShowMediaPicker(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <MediaLibrary onSelect={handleMediaSelect} />
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <div>
                <h2 className="text-xl font-bold">Preview do Artigo</h2>
                <p className="text-sm text-gray-500">
                  Visualizacao de como o artigo aparecera no site
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <article className="max-w-3xl mx-auto">
                {formData.feature_image && (
                  <img
                    src={formData.feature_image}
                    alt={formData.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {formData.title || 'Titulo do Artigo'}
                </h1>
                {formData.excerpt && (
                  <p className="text-xl text-gray-600 mb-6 italic">{formData.excerpt}</p>
                )}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {formData.tags.map((tag, idx) => (
                      <span
                        key={tag.id || idx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                <hr className="mb-6" />
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewHtml) }}
                />
              </article>
            </div>
          </div>
        </div>
      )}

      {/* Inline Image Picker Modal (for toolbar image button) */}
      {showInlineImagePicker && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowInlineImagePicker(false)}
        >
          <div
            className="bg-gray-100 rounded-xl w-full max-w-5xl max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Inserir Imagem no Conteudo</h2>
              <button
                onClick={() => setShowInlineImagePicker(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <MediaLibrary onSelect={handleInlineImageSelect} />
          </div>
        </div>
      )}

      {/* Revision History Modal */}
      {showRevisionHistory && isEditing && (
        <RevisionHistory
          articleId={id}
          onRestore={() => {
            setShowRevisionHistory(false);
            fetchArticle(); // Reload article after restore
          }}
          onClose={() => setShowRevisionHistory(false)}
        />
      )}
    </div>
  );
};

export default ArticleEditor;

import api from './api';

export const getArticles = async (params) => {
  const response = await api.get('/api/articles', { params });
  return response.data;
};

export const getArticle = async (id) => {
  const response = await api.get(`/api/articles/${id}`);
  return response.data;
};

export const createArticle = async (data) => {
  const response = await api.post('/api/articles', data);
  return response.data;
};

export const updateArticle = async (id, data) => {
  const response = await api.put(`/api/articles/${id}`, data);
  return response.data;
};

export const deleteArticle = async (id) => {
  const response = await api.delete(`/api/articles/${id}`);
  return response.data;
};

export const getTags = async () => {
  const response = await api.get('/api/articles/tags');
  return response.data;
};

export const getAuthors = async () => {
  const response = await api.get('/api/articles/authors');
  return response.data;
};

export const getArticleTypes = async () => {
  const response = await api.get('/api/articles/types');
  return response.data;
};

// Article type constants for frontend use
export const ARTICLE_TYPES = {
  cronica: { value: 'cronica', label: 'Cronica', color: 'purple' },
  reportagem: { value: 'reportagem', label: 'Reportagem', color: 'blue' },
  opiniao: { value: 'opiniao', label: 'Opiniao', color: 'orange' }
};

// Article category constants (matches routes.yaml)
export const ARTICLE_CATEGORIES = {
  politica: { value: 'politica', label: 'Politica', slug: 'politica' },
  economia: { value: 'economia', label: 'Economia', slug: 'economia' },
  justica: { value: 'justica', label: 'Justica', slug: 'justica' },
  internacional: { value: 'internacional', label: 'Internacional', slug: 'internacional' },
  sociedade: { value: 'sociedade', label: 'Sociedade', slug: 'sociedade' },
  saude: { value: 'saude', label: 'Saude', slug: 'saude' },
  educacao: { value: 'educacao', label: 'Educacao', slug: 'educacao' },
  ambiente: { value: 'ambiente', label: 'Ambiente', slug: 'ambiente' },
  tecnologia: { value: 'tecnologia', label: 'Tecnologia', slug: 'tecnologia' },
  cultura: { value: 'cultura', label: 'Cultura', slug: 'cultura' },
  magazine: { value: 'magazine', label: 'Magazine', slug: 'magazine' },
  investigacoes: { value: 'investigacoes', label: 'Investigacoes', slug: 'investigacoes' }
};

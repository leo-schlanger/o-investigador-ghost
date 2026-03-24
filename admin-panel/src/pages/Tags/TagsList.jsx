import React, { useState, useEffect } from 'react';
import { getTags, createTag, updateTag, deleteTag } from '../../services/tags';
import { Plus, Edit2, Trash2, X, Tag, Image as ImageIcon } from 'lucide-react';
import MediaLibrary from '../Media/MediaLibrary';

const TagsList = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    feature_image: '',
    meta_title: '',
    meta_description: ''
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await getTags();
      setTags(data);
    } catch (err) {
      setError('Falha ao carregar tags');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tag = null) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name || '',
        slug: tag.slug || '',
        description: tag.description || '',
        feature_image: tag.feature_image || '',
        meta_title: tag.meta_title || '',
        meta_description: tag.meta_description || ''
      });
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        feature_image: '',
        meta_title: '',
        meta_description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMediaSelect = (item) => {
    setFormData((prev) => ({ ...prev, feature_image: item.url }));
    setShowMediaPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await updateTag(editingTag.id, formData);
      } else {
        await createTag(formData);
      }
      handleCloseModal();
      loadTags();
    } catch (err) {
      alert(err.response?.data?.error || 'Falha ao salvar tag');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteTag(deleteConfirm.id);
      setDeleteConfirm(null);
      loadTags();
    } catch (err) {
      alert(err.response?.data?.error || 'Falha ao excluir tag');
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Tags</h1>
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto bg-brand text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-light text-sm sm:text-base"
        >
          <Plus size={20} />
          Nova Tag
        </button>
      </div>

      {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {tags.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Tag size={48} className="mx-auto mb-2 opacity-30" />
            <p>Nenhuma tag encontrada. Crie a primeira!</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tag
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artigos
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acoes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {tag.feature_image ? (
                            <img
                              src={tag.feature_image}
                              alt={tag.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <Tag size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                            {tag.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {tag.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        /{tag.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                          {tag.count || 0} artigos
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(tag)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(tag)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {tags.map((tag) => (
                <div key={tag.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {tag.feature_image ? (
                        <img
                          src={tag.feature_image}
                          alt={tag.name}
                          className="w-12 h-12 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center shrink-0">
                          <Tag size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">{tag.name}</p>
                        <p className="text-xs text-gray-500 truncate">/{tag.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenModal(tag)}
                        className="p-2 text-gray-500 hover:text-indigo-600 rounded"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(tag)}
                        className="p-2 text-gray-500 hover:text-red-600 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                      {tag.count || 0} artigos
                    </span>
                    {tag.description && (
                      <span className="text-xs text-gray-400 truncate">{tag.description}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold">
                {editingTag ? 'Editar Tag' : 'Nova Tag'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 p-1">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-brand focus:border-brand text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="Gerado automaticamente se vazio"
                  className="block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-brand focus:border-brand text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-brand focus:border-brand text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagem</label>
                {formData.feature_image ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.feature_image}
                      alt="Tag"
                      className="h-20 sm:h-24 rounded border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, feature_image: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand hover:text-brand text-sm"
                  >
                    <ImageIcon size={16} />
                    Adicionar imagem
                  </button>
                )}
              </div>

              <hr className="my-4" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Titulo (SEO)
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-brand focus:border-brand text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Descricao (SEO)
                </label>
                <textarea
                  name="meta_description"
                  rows={2}
                  value={formData.meta_description}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-brand focus:border-brand text-sm"
                />
              </div>

              <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-brand hover:bg-brand-light"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowMediaPicker(false)}
        >
          <div
            className="bg-gray-100 rounded-xl w-full max-w-5xl max-h-[85vh] overflow-y-auto p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Selecionar Imagem</h2>
              <button
                onClick={() => setShowMediaPicker(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={24} />
              </button>
            </div>
            <MediaLibrary onSelect={handleMediaSelect} />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 sm:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar exclusao</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-6">
              Tem certeza que deseja excluir a tag <strong>"{deleteConfirm.name}"</strong>? Os
              artigos associados nao serao excluidos.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsList;

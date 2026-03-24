import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/auth';
import { Camera, X, User } from 'lucide-react';
import api from '../../services/api';

const Profile = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setStatus({
        type: 'error',
        message: 'Tipo de arquivo nao permitido. Use: JPG, PNG, GIF ou WebP'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'Imagem muito grande. Maximo permitido: 5MB' });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploadingAvatar(true);
    setStatus({ type: '', message: '' });

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const response = await api.post('/api/media/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAvatar(response.data.url);
      setStatus({ type: 'success', message: 'Foto carregada! Clique em Salvar para confirmar.' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'Erro ao carregar foto: ' + (err.response?.data?.error || err.message)
      });
      setAvatarPreview(user?.avatar || null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(''); // Empty string to clear avatar
    setAvatarPreview(null);
    setStatus({ type: 'info', message: 'Foto removida. Clique em Salvar para confirmar.' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (formData.password && formData.password !== formData.confirmPassword) {
      return setStatus({ type: 'error', message: 'As senhas nao coincidem' });
    }

    setSaving(true);
    try {
      const dataToUpdate = {
        name: formData.name,
        email: formData.email
      };

      if (formData.password) {
        dataToUpdate.password = formData.password;
      }

      // Include avatar if changed
      if (avatar !== null) {
        dataToUpdate.avatar = avatar;
      }

      await updateProfile(dataToUpdate);
      setStatus({ type: 'success', message: 'Perfil atualizado com sucesso!' });

      // Reset avatar state
      setAvatar(null);

      // Re-fetch to update UI
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.error || 'Erro ao atualizar perfil'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Meu Perfil</h1>

      {status.message && (
        <div
          className={`p-3 sm:p-4 rounded mb-4 sm:mb-6 text-sm sm:text-base ${
            status.type === 'error'
              ? 'bg-red-100 text-red-700'
              : status.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 pb-6 border-b">
            <div className="relative">
              <div
                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg cursor-pointer group ${uploadingAvatar ? 'opacity-50' : ''}`}
                onClick={handleAvatarClick}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand text-white">
                    <User size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600"
                  title="Remover foto"
                >
                  <X size={16} />
                </button>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-medium text-gray-900">{user?.name || 'Usuario'}</h2>
              <p className="text-sm text-gray-500 capitalize">{user?.role || 'Autor'}</p>
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="mt-2 text-sm text-brand hover:text-brand-light disabled:opacity-50"
              >
                {uploadingAvatar ? 'Carregando...' : 'Alterar foto'}
              </button>
            </div>
          </div>

          {/* Personal Info Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
              Informacoes Pessoais
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand focus:border-brand sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand focus:border-brand sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div>
            <h2 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 mb-4 mt-6 sm:mt-8">
              Alterar Senha
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              Deixe em branco se nao quiser alterar sua senha.
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand focus:border-brand sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand focus:border-brand sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving || uploadingAvatar}
              className="w-full sm:w-auto bg-brand text-white px-4 py-2.5 sm:py-2 rounded shadow hover:bg-brand-light disabled:opacity-50 text-sm sm:text-base"
            >
              {saving ? 'Salvando...' : 'Salvar Alteracoes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

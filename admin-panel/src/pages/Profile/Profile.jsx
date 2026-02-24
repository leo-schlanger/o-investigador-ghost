import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/auth';

const Profile = () => {
    const { user, login } = useAuth(); // login is essentially a way to update the user object if needed, though we can just wait for re-fetch or update it manually. Actually, AuthContext might need a refresh user function, but we can just reload or update the state.

    // We don't have a direct `setUser` exported from useAuth, so after updating, 
    // we might just reload the window to update the nav, or just let it be.
    // The easiest for now is a simple window.location.reload() or trusting the context update.

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [status, setStatus] = useState({ type: '', message: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (formData.password && formData.password !== formData.confirmPassword) {
            return setStatus({ type: 'error', message: 'As senhas não coincidem' });
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

            const updatedUser = await updateProfile(dataToUpdate);
            setStatus({ type: 'success', message: 'Perfil atualizado com sucesso!' });

            // Re-fetch or reload to update UI with new name/email
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.error || 'Erro ao atualizar perfil' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

            {status.message && (
                <div className={`p-4 rounded mb-6 ${status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {status.message}
                </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Informações Pessoais</h2>

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

                    <div>
                        <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 mt-8">Alterar Senha</h2>
                        <p className="text-sm text-gray-500 mb-4">Deixe em branco se não quiser alterar sua senha.</p>

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
                                <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
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
                            disabled={saving}
                            className="bg-brand text-white px-4 py-2 rounded shadow hover:bg-brand-light disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;

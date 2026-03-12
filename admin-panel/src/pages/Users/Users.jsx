import React, { useState, useEffect } from 'react';
import { getUsers, deleteUser, createUser, updateUser } from '../../services/users';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, X, Shield, User as UserIcon } from 'lucide-react';

const UsersPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'author'
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            setError('Falha ao carregar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({ name: user.name, email: user.email, password: '', role: user.role });
        } else {
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'author' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                const data = { ...formData };
                if (!data.password) delete data.password; // Don't send empty password if not changing
                await updateUser(editingUser.id, data);
            } else {
                await createUser(formData);
            }
            handleCloseModal();
            loadUsers();
        } catch (err) {
            alert(err.response?.data?.error || 'Falha ao salvar usuario');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este usuario?')) {
            try {
                await deleteUser(id);
                loadUsers();
            } catch (err) {
                alert(err.response?.data?.error || 'Falha ao excluir usuario');
            }
        }
    };

    const RoleBadge = ({ role }) => {
        const styles = {
            admin: 'bg-red-100 text-red-800',
            editor: 'bg-blue-100 text-blue-800',
            author: 'bg-green-100 text-green-800'
        };
        const labels = {
            admin: 'Admin',
            editor: 'Editor',
            author: 'Autor'
        };
        return (
            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[role] || 'bg-gray-100'}`}>
                {labels[role] || role}
            </span>
        );
    };

    if (loading) return <div className="text-center py-12">Carregando usuarios...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold">Gerenciar Usuarios</h1>
                {currentUser?.role === 'admin' && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="w-full sm:w-auto bg-brand text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-light text-sm sm:text-base"
                    >
                        <Plus size={20} />
                        Novo Usuario
                    </button>
                )}
            </div>

            {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acoes</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                {u.role === 'admin' ? <Shield size={20} className="text-red-500" /> : <UserIcon size={20} className="text-gray-500" />}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <RoleBadge role={u.role} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenModal(u)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        {u.id !== currentUser.id && (
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                    {users.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            Nenhum usuario encontrado
                        </div>
                    ) : (
                        users.map((u) => (
                            <div key={u.id} className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                                            {u.role === 'admin' ? <Shield size={20} className="text-red-500" /> : <UserIcon size={20} className="text-gray-500" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => handleOpenModal(u)}
                                            className="p-2 text-gray-500 hover:text-indigo-600 rounded"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        {u.id !== currentUser.id && (
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="p-2 text-gray-500 hover:text-red-600 rounded"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 pl-13">
                                    <RoleBadge role={u.role} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg sm:text-xl font-bold">{editingUser ? 'Editar Usuario' : 'Novo Usuario'}</h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 p-1">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-brand focus:border-brand text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-brand focus:border-brand text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Senha {editingUser && <span className="text-gray-400 font-normal">(deixe vazio para manter)</span>}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-brand focus:border-brand text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Acesso</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-brand focus:border-brand text-sm"
                                >
                                    <option value="author">Autor (Apenas artigos proprios)</option>
                                    <option value="editor">Editor (Todos os artigos)</option>
                                    <option value="admin">Administrador (Acesso Total)</option>
                                </select>
                            </div>

                            <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="w-full sm:w-auto bg-white py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-brand hover:bg-brand-light"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;

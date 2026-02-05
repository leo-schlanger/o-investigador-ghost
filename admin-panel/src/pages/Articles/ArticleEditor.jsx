import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createArticle, getArticle, updateArticle } from '../../services/articles';

const ArticleEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        status: 'draft',
        feature_image: ''
    });
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditing) {
            fetchArticle();
        }
    }, [id]);

    const fetchArticle = async () => {
        try {
            const data = await getArticle(id);
            setFormData({
                title: data.title,
                content: data.content || '',
                status: data.status,
                feature_image: data.feature_image || ''
            });
        } catch (error) {
            setError('Failed to load article');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            if (isEditing) {
                await updateArticle(id, formData);
            } else {
                await createArticle(formData);
            }
            navigate('/articles');
        } catch (err) {
            setError('Failed to save article');
            setSaving(false);
        }
    };

    if (loading) return <div>Loading editor...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Article' : 'New Article'}</h1>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded shadow">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Content (Markdown/HTML)</label>
                    <textarea
                        name="content"
                        rows={15}
                        value={formData.content}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="scheduled">Scheduled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Featured Image URL</label>
                        <input
                            type="text"
                            name="feature_image"
                            value={formData.feature_image}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/articles')}
                        className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-light disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Article'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ArticleEditor;

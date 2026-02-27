import { useRef, useEffect, useCallback } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Image from '@editorjs/image';
import Embed from '@editorjs/embed';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import Table from '@editorjs/table';
import Delimiter from '@editorjs/delimiter';
import api from '../services/api';

/**
 * Custom hook for Editor.js integration
 * @param {Object} options - Configuration options
 * @param {string} options.holderId - The ID of the container element
 * @param {Object} options.initialData - Initial editor data
 * @param {Function} options.onChange - Callback when content changes
 * @param {string} options.placeholder - Placeholder text
 * @returns {Object} - { editorRef, save, clear, isReady }
 */
const useEditorJs = ({ holderId = 'editorjs', initialData = null, onChange, placeholder = 'Comece a escrever seu artigo...' }) => {
    const editorRef = useRef(null);
    const isReadyRef = useRef(false);

    // Image upload handler
    const uploadByFile = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/api/media', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return {
                success: 1,
                file: {
                    url: response.data.url,
                },
            };
        } catch (error) {
            console.error('Image upload failed:', error);
            return {
                success: 0,
                message: 'Upload failed',
            };
        }
    };

    // Image upload by URL
    const uploadByUrl = async (url) => {
        return {
            success: 1,
            file: {
                url,
            },
        };
    };

    // Initialize Editor
    useEffect(() => {
        if (editorRef.current) return;

        const editor = new EditorJS({
            holder: holderId,
            placeholder,
            autofocus: false,
            data: initialData || undefined,
            tools: {
                header: {
                    class: Header,
                    config: {
                        placeholder: 'Título da seção',
                        levels: [2, 3, 4],
                        defaultLevel: 2,
                    },
                },
                list: {
                    class: List,
                    inlineToolbar: true,
                    config: {
                        defaultStyle: 'unordered',
                    },
                },
                image: {
                    class: Image,
                    config: {
                        uploader: {
                            uploadByFile,
                            uploadByUrl,
                        },
                        captionPlaceholder: 'Legenda da imagem',
                    },
                },
                embed: {
                    class: Embed,
                    config: {
                        services: {
                            youtube: true,
                            twitter: true,
                            instagram: true,
                            vimeo: true,
                            codepen: true,
                        },
                    },
                },
                quote: {
                    class: Quote,
                    inlineToolbar: true,
                    config: {
                        quotePlaceholder: 'Citação',
                        captionPlaceholder: 'Autor',
                    },
                },
                code: {
                    class: Code,
                    config: {
                        placeholder: 'Código',
                    },
                },
                table: {
                    class: Table,
                    inlineToolbar: true,
                },
                delimiter: Delimiter,
            },
            onChange: async (api) => {
                if (onChange && isReadyRef.current) {
                    try {
                        const data = await api.saver.save();
                        onChange(data);
                    } catch (error) {
                        console.error('Error saving editor data:', error);
                    }
                }
            },
            onReady: () => {
                isReadyRef.current = true;
            },
        });

        editorRef.current = editor;

        return () => {
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
                isReadyRef.current = false;
            }
        };
    }, [holderId]);

    // Save editor content
    const save = useCallback(async () => {
        if (!editorRef.current || !isReadyRef.current) {
            return null;
        }

        try {
            const data = await editorRef.current.save();
            return data;
        } catch (error) {
            console.error('Error saving editor content:', error);
            return null;
        }
    }, []);

    // Clear editor content
    const clear = useCallback(async () => {
        if (!editorRef.current || !isReadyRef.current) {
            return;
        }

        try {
            await editorRef.current.clear();
        } catch (error) {
            console.error('Error clearing editor:', error);
        }
    }, []);

    // Render content
    const render = useCallback(async (data) => {
        if (!editorRef.current || !isReadyRef.current || !data) {
            return;
        }

        try {
            await editorRef.current.render(data);
        } catch (error) {
            console.error('Error rendering editor content:', error);
        }
    }, []);

    return {
        editorRef,
        save,
        clear,
        render,
        isReady: isReadyRef.current,
    };
};

export default useEditorJs;

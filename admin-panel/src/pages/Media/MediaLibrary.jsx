import React, { useState } from 'react';
import { uploadMedia } from '../../services/media';

const MediaLibrary = () => {
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError('');
        setUploadedFile(null);

        try {
            const data = await uploadMedia(file);
            setUploadedFile(data);
        } catch (err) {
            setError('Failed to upload file');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Media Library</h1>

            <div className="bg-white p-6 rounded shadow mb-8">
                <h3 className="text-lg font-medium mb-4">Upload New Media</h3>
                <div className="flex items-center space-x-4">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary-50 file:text-primary-700
                            hover:file:bg-primary-100"
                    />
                    {uploading && <span className="text-primary-500">Uploading...</span>}
                </div>
                {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}

                {uploadedFile && (
                    <div className="mt-6 p-4 border rounded bg-gray-50">
                        <p className="text-green-600 font-medium mb-2">Upload Successful!</p>
                        <div className="flex items-start space-x-4">
                            <img src={uploadedFile.url} alt="Uploaded" className="h-32 object-contain bg-white border" />
                            <div>
                                <p className="text-sm"><strong>URL:</strong> <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer" className="text-primary-500 underline break-all">{uploadedFile.url}</a></p>
                                <p className="text-sm mt-1"><strong>Filename:</strong> {uploadedFile.filename}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded shadow">
                <h3 className="text-lg font-medium mb-4">Recent Uploads</h3>
                <p className="text-gray-500 text-sm">Media gallery list not implemented (requires storage persistence API).</p>
            </div>
        </div>
    );
};

export default MediaLibrary;

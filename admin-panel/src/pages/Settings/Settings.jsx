import React from 'react';

const SettingsPage = () => {
    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium mb-4">General Settings</h2>
                <form>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Site Title</label>
                            <input type="text" defaultValue="O Investigador" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Site Description</label>
                            <textarea rows={3} defaultValue="Investigative Journalism Portal" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <button type="button" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-light focus:outline-none">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;

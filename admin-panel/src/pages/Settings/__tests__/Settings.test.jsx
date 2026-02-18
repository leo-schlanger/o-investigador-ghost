import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from '../Settings';

// Mock the settings service
vi.mock('../../../services/settings', () => ({
    getSettings: vi.fn(),
    updateSettings: vi.fn()
}));

import { getSettings, updateSettings } from '../../../services/settings';

describe('SettingsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show loading state initially', () => {
        getSettings.mockReturnValue(new Promise(() => {})); // Never resolves

        render(<SettingsPage />);

        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    });

    it('should load and display settings', async () => {
        getSettings.mockResolvedValue({
            siteTitle: 'My Test Site',
            siteDescription: 'A great site'
        });

        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByLabelText('Site Title')).toHaveValue('My Test Site');
        });

        expect(screen.getByLabelText('Site Description')).toHaveValue('A great site');
    });

    it('should use default values when settings are empty', async () => {
        getSettings.mockResolvedValue({});

        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByLabelText('Site Title')).toHaveValue('O Investigador');
        });

        expect(screen.getByLabelText('Site Description')).toHaveValue('Investigative Journalism Portal');
    });

    it('should show error message when loading fails', async () => {
        getSettings.mockRejectedValue(new Error('Network error'));

        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load settings')).toBeInTheDocument();
        });
    });

    it('should update settings on form change', async () => {
        const user = userEvent.setup();
        getSettings.mockResolvedValue({
            siteTitle: 'Original Title',
            siteDescription: 'Original Description'
        });

        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByLabelText('Site Title')).toHaveValue('Original Title');
        });

        const titleInput = screen.getByLabelText('Site Title');
        await user.clear(titleInput);
        await user.type(titleInput, 'New Title');

        expect(titleInput).toHaveValue('New Title');
    });

    it('should save settings successfully', async () => {
        const user = userEvent.setup();
        getSettings.mockResolvedValue({
            siteTitle: 'Original Title',
            siteDescription: 'Original Description'
        });
        updateSettings.mockResolvedValue({
            siteTitle: 'New Title',
            siteDescription: 'Original Description'
        });

        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByLabelText('Site Title')).toHaveValue('Original Title');
        });

        const titleInput = screen.getByLabelText('Site Title');
        await user.clear(titleInput);
        await user.type(titleInput, 'New Title');

        const saveButton = screen.getByRole('button', { name: 'Save Changes' });
        await user.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Settings saved successfully!')).toBeInTheDocument();
        });

        expect(updateSettings).toHaveBeenCalledWith({
            siteTitle: 'New Title',
            siteDescription: 'Original Description'
        });
    });

    it('should show error message when save fails', async () => {
        const user = userEvent.setup();
        getSettings.mockResolvedValue({
            siteTitle: 'Title',
            siteDescription: 'Description'
        });
        updateSettings.mockRejectedValue(new Error('Save failed'));

        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByLabelText('Site Title')).toBeInTheDocument();
        });

        const saveButton = screen.getByRole('button', { name: 'Save Changes' });
        await user.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to save settings')).toBeInTheDocument();
        });
    });

    it('should show saving state while saving', async () => {
        const user = userEvent.setup();
        getSettings.mockResolvedValue({
            siteTitle: 'Title',
            siteDescription: 'Description'
        });
        updateSettings.mockReturnValue(new Promise(() => {})); // Never resolves

        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByLabelText('Site Title')).toBeInTheDocument();
        });

        const saveButton = screen.getByRole('button', { name: 'Save Changes' });
        await user.click(saveButton);

        expect(screen.getByRole('button', { name: 'Saving...' })).toBeInTheDocument();
    });
});

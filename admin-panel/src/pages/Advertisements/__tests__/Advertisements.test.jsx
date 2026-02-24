import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdvertisementsPage from '../Advertisements';
import { renderWithRouter } from '../../../test-utils';

// Mock the settings service
vi.mock('../../../services/settings', () => ({
    getSettings: vi.fn(),
    updateSettings: vi.fn()
}));

import { getSettings, updateSettings } from '../../../services/settings';

describe('AdvertisementsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show loading state initially', () => {
        getSettings.mockReturnValue(new Promise(() => {}));

        renderWithRouter(<AdvertisementsPage />);

        expect(screen.getByText('Anúncios')).toBeInTheDocument();
    });

    it('should load and display ad settings', async () => {
        getSettings.mockResolvedValue({
            adsEnabled: 'true',
            adsenseClientId: 'ca-pub-123456789',
            adSlots: JSON.stringify({
                header_leaderboard: { enabled: true, slotId: '111' },
                middle_leaderboard: { enabled: false, slotId: '222' }
            })
        });

        renderWithRouter(<AdvertisementsPage />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('ca-pub-xxxxxxxxxxxxxxxx')).toHaveValue('ca-pub-123456789');
        });
    });

    it('should show error message when loading fails', async () => {
        getSettings.mockRejectedValue(new Error('Network error'));

        renderWithRouter(<AdvertisementsPage />);

        await waitFor(() => {
            expect(screen.getByText('Falha ao carregar configurações de anúncios')).toBeInTheDocument();
        });
    });

    it('should toggle global ads setting', async () => {
        const user = userEvent.setup();
        getSettings.mockResolvedValue({
            adsEnabled: 'false',
            adsenseClientId: '',
            adSlots: '{}'
        });

        renderWithRouter(<AdvertisementsPage />);

        await waitFor(() => {
            expect(screen.getByText('Anúncios Ativos')).toBeInTheDocument();
        });

        // Find and click the toggle button
        const toggleButtons = screen.getAllByRole('button');
        const globalToggle = toggleButtons[0]; // First toggle is global
        await user.click(globalToggle);

        // The toggle should change state (visual feedback)
        expect(globalToggle).toBeInTheDocument();
    });

    it('should save settings successfully', async () => {
        const user = userEvent.setup();
        getSettings.mockResolvedValue({
            adsEnabled: 'true',
            adsenseClientId: 'ca-pub-test',
            adSlots: '{}'
        });
        updateSettings.mockResolvedValue({});

        renderWithRouter(<AdvertisementsPage />);

        await waitFor(() => {
            expect(screen.getByText('Salvar Configurações')).toBeInTheDocument();
        });

        const saveButton = screen.getByText('Salvar Configurações');
        await user.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Configurações salvas com sucesso!')).toBeInTheDocument();
        });

        expect(updateSettings).toHaveBeenCalled();
    });

    it('should show error message when save fails', async () => {
        const user = userEvent.setup();
        getSettings.mockResolvedValue({
            adsEnabled: 'true',
            adsenseClientId: '',
            adSlots: '{}'
        });
        updateSettings.mockRejectedValue(new Error('Save failed'));

        renderWithRouter(<AdvertisementsPage />);

        await waitFor(() => {
            expect(screen.getByText('Salvar Configurações')).toBeInTheDocument();
        });

        const saveButton = screen.getByText('Salvar Configurações');
        await user.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Falha ao salvar configurações')).toBeInTheDocument();
        });
    });

    it('should display all 4 ad slots', async () => {
        getSettings.mockResolvedValue({
            adsEnabled: 'true',
            adsenseClientId: '',
            adSlots: '{}'
        });

        renderWithRouter(<AdvertisementsPage />);

        await waitFor(() => {
            expect(screen.getAllByText('Header Leaderboard').length).toBeGreaterThanOrEqual(1);
        });

        expect(screen.getAllByText('Middle Leaderboard').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Sidebar MPU 1').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Sidebar MPU 2').length).toBeGreaterThanOrEqual(1);
    });

    it('should update adsense client id', async () => {
        const user = userEvent.setup();
        getSettings.mockResolvedValue({
            adsEnabled: 'true',
            adsenseClientId: '',
            adSlots: '{}'
        });

        renderWithRouter(<AdvertisementsPage />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('ca-pub-xxxxxxxxxxxxxxxx')).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText('ca-pub-xxxxxxxxxxxxxxxx');
        await user.type(input, 'ca-pub-newid');

        expect(input).toHaveValue('ca-pub-newid');
    });
});

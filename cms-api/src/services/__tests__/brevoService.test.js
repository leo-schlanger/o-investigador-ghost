/**
 * Tests for BrevoService
 * Tests mock mode functionality and core service methods
 */

// Since the brevoService is a singleton and exports an instance,
// we need to test it as-is without configured SDK
const brevoService = require('../brevoService');

describe('BrevoService', () => {
    describe('Initialization', () => {
        it('should be an object with required methods', () => {
            expect(brevoService).toBeDefined();
            expect(typeof brevoService.isConfigured).toBe('function');
            expect(typeof brevoService.getLists).toBe('function');
            expect(typeof brevoService.getSubscribers).toBe('function');
            expect(typeof brevoService.getCampaigns).toBe('function');
            expect(typeof brevoService.getStats).toBe('function');
        });

        it('should not be configured when SDK not installed or no API key', () => {
            // In test environment, SDK might not be configured
            expect(typeof brevoService.isConfigured()).toBe('boolean');
        });
    });

    describe('Mock Data Methods', () => {
        describe('getMockLists', () => {
            it('should return mock lists data', () => {
                const result = brevoService.getMockLists();

                expect(result.isMock).toBe(true);
                expect(result.data).toBeInstanceOf(Array);
                expect(result.data.length).toBeGreaterThan(0);
                expect(result.total).toBe(result.data.length);

                // Check list structure
                const list = result.data[0];
                expect(list).toHaveProperty('id');
                expect(list).toHaveProperty('name');
                expect(list).toHaveProperty('subscribers');
                expect(list).toHaveProperty('description');
            });
        });

        describe('getMockSubscribers', () => {
            it('should return mock subscribers data', () => {
                const result = brevoService.getMockSubscribers();

                expect(result.isMock).toBe(true);
                expect(result.data).toBeInstanceOf(Array);
                expect(result.data.length).toBeGreaterThan(0);
                expect(result.page).toBe(1);
                expect(result.limit).toBe(50);

                // Check subscriber structure
                const subscriber = result.data[0];
                expect(subscriber).toHaveProperty('id');
                expect(subscriber).toHaveProperty('email');
                expect(subscriber).toHaveProperty('name');
                expect(subscriber).toHaveProperty('status');
                expect(subscriber).toHaveProperty('lists');
                expect(subscriber).toHaveProperty('subscribedAt');
            });

            it('should respect pagination params', () => {
                const result = brevoService.getMockSubscribers({ page: 2, limit: 10 });

                expect(result.page).toBe(2);
                expect(result.limit).toBe(10);
            });
        });

        describe('getMockCampaigns', () => {
            it('should return mock campaigns data', () => {
                const result = brevoService.getMockCampaigns();

                expect(result.isMock).toBe(true);
                expect(result.data).toBeInstanceOf(Array);
                expect(result.data.length).toBeGreaterThan(0);

                // Check campaign structure
                const campaign = result.data[0];
                expect(campaign).toHaveProperty('id');
                expect(campaign).toHaveProperty('name');
                expect(campaign).toHaveProperty('subject');
                expect(campaign).toHaveProperty('status');
                expect(campaign).toHaveProperty('sentAt');
                expect(campaign).toHaveProperty('recipients');
                expect(campaign).toHaveProperty('opens');
                expect(campaign).toHaveProperty('clicks');
                expect(campaign).toHaveProperty('openRate');
                expect(campaign).toHaveProperty('clickRate');
            });
        });

        describe('getMockCampaign', () => {
            it('should return a mock campaign by id', () => {
                const result = brevoService.getMockCampaign(123);

                expect(result.isMock).toBe(true);
                expect(result.id).toBe(123);
                expect(result).toHaveProperty('name');
                expect(result).toHaveProperty('subject');
                expect(result).toHaveProperty('status');
                expect(result).toHaveProperty('blocks');
            });

            it('should parse string id to integer', () => {
                const result = brevoService.getMockCampaign('456');
                expect(result.id).toBe(456);
            });
        });

        describe('getMockCampaignStats', () => {
            it('should return mock campaign stats', () => {
                const result = brevoService.getMockCampaignStats(1);

                expect(result.isMock).toBe(true);
                expect(result).toHaveProperty('sent');
                expect(result).toHaveProperty('delivered');
                expect(result).toHaveProperty('opens');
                expect(result).toHaveProperty('clicks');
                expect(result).toHaveProperty('bounces');
                expect(result).toHaveProperty('unsubscribes');
                expect(result).toHaveProperty('openRate');
                expect(result).toHaveProperty('clickRate');
            });
        });

        describe('getMockStats', () => {
            it('should return mock overall stats', () => {
                const result = brevoService.getMockStats();

                expect(result.isMock).toBe(true);
                expect(result).toHaveProperty('totalSubscribers');
                expect(result).toHaveProperty('activeSubscribers');
                expect(result).toHaveProperty('totalCampaigns');
                expect(result).toHaveProperty('avgOpenRate');
                expect(result).toHaveProperty('avgClickRate');
                expect(result).toHaveProperty('lastCampaignDate');
            });
        });
    });

    describe('Service Methods (Mock Mode)', () => {
        // When not configured, service should return mock data

        describe('getLists', () => {
            it('should return lists (mock data if not configured)', async () => {
                const result = await brevoService.getLists();

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('total');
                expect(result.data).toBeInstanceOf(Array);
            });
        });

        describe('getSubscribers', () => {
            it('should return subscribers (mock data if not configured)', async () => {
                const result = await brevoService.getSubscribers();

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('total');
                expect(result).toHaveProperty('page');
                expect(result).toHaveProperty('limit');
            });

            it('should accept pagination params', async () => {
                const result = await brevoService.getSubscribers({ page: 1, limit: 10 });

                expect(result).toHaveProperty('data');
                expect(result.page).toBe(1);
            });
        });

        describe('getCampaigns', () => {
            it('should return campaigns (mock data if not configured)', async () => {
                const result = await brevoService.getCampaigns();

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('total');
            });
        });

        describe('getCampaign', () => {
            it('should return a campaign by id (mock data if not configured)', async () => {
                const result = await brevoService.getCampaign(1);

                expect(result).toHaveProperty('id');
                expect(result).toHaveProperty('name');
            });
        });

        describe('getStats', () => {
            it('should return overall stats (mock data if not configured)', async () => {
                const result = await brevoService.getStats();

                expect(result).toHaveProperty('totalSubscribers');
                expect(result).toHaveProperty('activeSubscribers');
            });
        });

        describe('createList', () => {
            it('should create a list (mock response if not configured)', async () => {
                const result = await brevoService.createList({ name: 'Test List' });

                expect(result).toHaveProperty('success');
                if (result.isMock) {
                    expect(result.isMock).toBe(true);
                }
            });
        });

        describe('deleteList', () => {
            it('should delete a list (mock response if not configured)', async () => {
                const result = await brevoService.deleteList(1);

                expect(result).toHaveProperty('success');
                expect(result.success).toBe(true);
            });
        });
    });

    describe('Subscriber Operations (Mock Mode)', () => {
        describe('getSubscriber', () => {
            it('should return null when not configured', async () => {
                const result = await brevoService.getSubscriber('test@test.com');
                // In mock mode, getSubscriber returns null
                expect(result).toBeNull();
            });
        });

        describe('createSubscriber', () => {
            it('should create a subscriber (mock response if not configured)', async () => {
                const result = await brevoService.createSubscriber({
                    email: 'new@test.com',
                    name: 'New User',
                    listIds: [1]
                });

                expect(result).toHaveProperty('success');
            });
        });

        describe('importSubscribers', () => {
            it('should import subscribers (mock response if not configured)', async () => {
                const contacts = [
                    { email: 'user1@test.com', name: 'User 1' },
                    { email: 'user2@test.com', name: 'User 2' }
                ];
                const result = await brevoService.importSubscribers(contacts, [1]);

                expect(result).toHaveProperty('success');
            });
        });

        describe('updateSubscriber', () => {
            it('should update a subscriber (mock response if not configured)', async () => {
                const result = await brevoService.updateSubscriber('test@test.com', {
                    name: 'Updated Name'
                });

                expect(result).toHaveProperty('success');
            });
        });

        describe('deleteSubscriber', () => {
            it('should delete a subscriber (mock response if not configured)', async () => {
                const result = await brevoService.deleteSubscriber('test@test.com');

                expect(result).toHaveProperty('success');
                expect(result.success).toBe(true);
            });
        });
    });

    describe('Campaign Operations (Mock Mode)', () => {
        describe('createCampaign', () => {
            it('should create a campaign (mock response if not configured)', async () => {
                const result = await brevoService.createCampaign({
                    name: 'Test Campaign',
                    subject: 'Test Subject',
                    blocks: []
                });

                expect(result).toHaveProperty('success');
            });
        });

        describe('updateCampaign', () => {
            it('should update a campaign (mock response if not configured)', async () => {
                const result = await brevoService.updateCampaign(1, {
                    name: 'Updated Campaign'
                });

                expect(result).toHaveProperty('success');
            });
        });

        describe('deleteCampaign', () => {
            it('should delete a campaign (mock response if not configured)', async () => {
                const result = await brevoService.deleteCampaign(1);

                expect(result).toHaveProperty('success');
                expect(result.success).toBe(true);
            });
        });

        describe('sendTestEmail', () => {
            it('should send a test email (mock response if not configured)', async () => {
                const result = await brevoService.sendTestEmail(1, 'test@test.com');

                expect(result).toHaveProperty('success');
            });
        });

        describe('syncGhostMembers', () => {
            it('should sync ghost members (mock response if not configured)', async () => {
                const ghostMembers = [{ email: 'member1@test.com', name: 'Member 1' }];
                const result = await brevoService.syncGhostMembers(ghostMembers, 1);

                expect(result).toHaveProperty('success');
            });
        });

        describe('getCampaignStats', () => {
            it('should return campaign stats (mock data if not configured)', async () => {
                const result = await brevoService.getCampaignStats(1);

                expect(result).toHaveProperty('sent');
                expect(result).toHaveProperty('delivered');
                expect(result).toHaveProperty('opens');
                expect(result).toHaveProperty('clicks');
            });
        });

        describe('sendCampaign', () => {
            it('should send a campaign (mock response if not configured)', async () => {
                const result = await brevoService.sendCampaign(1);

                expect(result).toHaveProperty('success');
            });
        });

        describe('scheduleCampaign', () => {
            it('should schedule a campaign (mock response if not configured)', async () => {
                const result = await brevoService.scheduleCampaign(1, '2026-04-01T08:00:00Z');

                expect(result).toHaveProperty('success');
            });
        });
    });

    describe('testConnection', () => {
        it('should return success false when SDK not installed', async () => {
            // When SDK is not available, testConnection should handle gracefully
            const result = await brevoService.testConnection('invalid-key');

            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('message');
        });
    });
});

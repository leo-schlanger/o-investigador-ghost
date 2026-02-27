const ghostApi = require('../services/ghostApi');

/**
 * Get navigation settings
 * GET /api/navigation
 */
exports.get = async (req, res) => {
    try {
        const navigation = await ghostApi.getNavigation();
        res.json(navigation);
    } catch (err) {
        console.error('Error getting navigation:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Update navigation settings
 * PUT /api/navigation
 */
exports.update = async (req, res) => {
    try {
        const { navigation, secondary_navigation } = req.body;

        // Validate navigation items
        if (navigation) {
            for (const item of navigation) {
                if (!item.label || !item.url) {
                    return res.status(400).json({ error: 'Each navigation item must have label and url' });
                }
            }
        }

        if (secondary_navigation) {
            for (const item of secondary_navigation) {
                if (!item.label || !item.url) {
                    return res.status(400).json({ error: 'Each navigation item must have label and url' });
                }
            }
        }

        const result = await ghostApi.updateNavigation(navigation, secondary_navigation);

        res.json({
            navigation: result.navigation || navigation,
            secondary_navigation: result.secondary_navigation || secondary_navigation
        });
    } catch (err) {
        console.error('Error updating navigation:', err);
        res.status(400).json({ error: err.message });
    }
};

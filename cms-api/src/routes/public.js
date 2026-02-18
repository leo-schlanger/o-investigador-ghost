const express = require('express');
const router = express.Router();
const { Settings } = require('../models');

// Public endpoint for ad settings (no auth required)
router.get('/ads-config', async (req, res) => {
    try {
        const settings = await Settings.findAll({
            where: {
                key: ['adsEnabled', 'adsenseClientId', 'adSlots']
            }
        });

        const config = {};
        settings.forEach(setting => {
            if (setting.key === 'adSlots') {
                try {
                    config[setting.key] = JSON.parse(setting.value);
                } catch (e) {
                    config[setting.key] = {};
                }
            } else if (setting.key === 'adsEnabled') {
                config[setting.key] = setting.value === 'true';
            } else {
                config[setting.key] = setting.value;
            }
        });

        // Set defaults
        config.adsEnabled = config.adsEnabled || false;
        config.adsenseClientId = config.adsenseClientId || '';
        config.adSlots = config.adSlots || {};

        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

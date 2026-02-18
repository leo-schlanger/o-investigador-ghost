const { Settings } = require('../models');

exports.getSettings = async (req, res) => {
    try {
        const settings = await Settings.findAll();

        // Convert array to object for easier frontend consumption
        const settingsObject = {};
        settings.forEach(setting => {
            settingsObject[setting.key] = setting.value;
        });

        res.json(settingsObject);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body;

        // Validate input
        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({ error: 'Invalid settings data' });
        }

        // Update each setting using upsert
        const promises = Object.entries(updates).map(async ([key, value]) => {
            const [setting] = await Settings.findOrCreate({
                where: { key },
                defaults: { value }
            });

            if (setting.value !== value) {
                setting.value = value;
                await setting.save();
            }

            return setting;
        });

        await Promise.all(promises);

        // Return updated settings
        const settings = await Settings.findAll();
        const settingsObject = {};
        settings.forEach(setting => {
            settingsObject[setting.key] = setting.value;
        });

        res.json(settingsObject);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

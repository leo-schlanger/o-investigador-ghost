const { Settings } = require('../models');

// Whitelist of allowed settings keys
const ALLOWED_SETTINGS = {
    // Site settings
    siteTitle: { type: 'string', maxLength: 100 },
    siteDescription: { type: 'string', maxLength: 500 },
    siteLogo: { type: 'string', maxLength: 500 },
    siteFavicon: { type: 'string', maxLength: 500 },

    // Ads settings
    adsEnabled: { type: 'string', enum: ['true', 'false'] },
    adsenseClientId: { type: 'string', maxLength: 100 },
    adSlots: { type: 'json' },

    // Social settings
    facebookUrl: { type: 'string', maxLength: 255 },
    twitterUrl: { type: 'string', maxLength: 255 },
    instagramUrl: { type: 'string', maxLength: 255 },

    // Analytics
    analyticsId: { type: 'string', maxLength: 50 },

    // Email settings
    emailFromName: { type: 'string', maxLength: 100 },
    emailFromAddress: { type: 'string', maxLength: 255 }
};

/**
 * Validate a setting value against its rules
 */
const validateSetting = (key, value) => {
    const rules = ALLOWED_SETTINGS[key];
    if (!rules) return { valid: false, error: `Setting "${key}" is not allowed` };

    // Check type and constraints
    if (rules.type === 'string') {
        if (typeof value !== 'string') {
            return { valid: false, error: `Setting "${key}" must be a string` };
        }
        if (rules.maxLength && value.length > rules.maxLength) {
            return {
                valid: false,
                error: `Setting "${key}" exceeds max length of ${rules.maxLength}`
            };
        }
        if (rules.enum && !rules.enum.includes(value)) {
            return {
                valid: false,
                error: `Setting "${key}" must be one of: ${rules.enum.join(', ')}`
            };
        }
    }

    if (rules.type === 'json') {
        if (typeof value !== 'string') {
            return { valid: false, error: `Setting "${key}" must be a JSON string` };
        }
        try {
            JSON.parse(value);
        } catch (e) {
            return { valid: false, error: `Setting "${key}" must be valid JSON` };
        }
    }

    return { valid: true };
};

exports.getSettings = async (req, res) => {
    try {
        const settings = await Settings.findAll();

        // Convert array to object for easier frontend consumption
        const settingsObject = {};
        settings.forEach((setting) => {
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
        if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
            return res.status(400).json({ error: 'Invalid settings data' });
        }

        // Validate each setting against whitelist
        for (const [key, value] of Object.entries(updates)) {
            const validation = validateSetting(key, value);
            if (!validation.valid) {
                return res.status(400).json({ error: validation.error });
            }
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
        settings.forEach((setting) => {
            settingsObject[setting.key] = setting.value;
        });

        res.json(settingsObject);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao salvar configuracoes' });
    }
};

const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/env');
const {
    createGhostUserDirect,
    findAuthorByEmail,
    updateGhostUserDirect,
    deleteGhostUserDirect
} = require('../services/ghostApi');
const logger = require('../utils/logger');

const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, getJwtSecret(), {
        expiresIn: '24h'
    });
};

/**
 * Create user in Ghost CMS (non-blocking)
 * @param {Object} userData - User data with name, email, password (hashed), role
 */
const createUserInGhost = async (userData) => {
    try {
        // Check if user already exists in Ghost
        const existingGhostUser = await findAuthorByEmail(userData.email);
        if (existingGhostUser) {
            logger.info('User already exists in Ghost', { email: userData.email });
            return { exists: true, ghostUser: existingGhostUser };
        }

        // Create user in Ghost
        const ghostUser = await createGhostUserDirect(userData, sequelize);
        logger.info('Created user in Ghost', { email: userData.email, ghostId: ghostUser.id });
        return { created: true, ghostUser };
    } catch (err) {
        logger.error('Failed to create user in Ghost', { email: userData.email, error: err.message });
        return { error: err.message };
    }
};

/**
 * Update user in Ghost CMS
 * @param {string} currentEmail - Current email to find the user
 * @param {Object} userData - Updated data (name, newEmail, password, role)
 */
const updateUserInGhost = async (currentEmail, userData) => {
    try {
        const result = await updateGhostUserDirect(currentEmail, userData, sequelize);
        if (result.notFound) {
            logger.warn('User not found in Ghost for update', { email: currentEmail });
            return { notFound: true };
        }
        logger.info('Updated user in Ghost', { email: currentEmail, ghostId: result.ghostId });
        return { updated: true, ghostId: result.ghostId };
    } catch (err) {
        logger.error('Failed to update user in Ghost', { email: currentEmail, error: err.message });
        return { error: err.message };
    }
};

/**
 * Delete user from Ghost CMS
 * @param {string} email - Email of user to delete
 */
const deleteUserFromGhost = async (email) => {
    try {
        const result = await deleteGhostUserDirect(email, sequelize);
        if (result.notFound) {
            logger.warn('User not found in Ghost for deletion', { email });
            return { notFound: true };
        }
        logger.info('Deleted user from Ghost', { email, ghostId: result.ghostId });
        return { deleted: true, ghostId: result.ghostId };
    } catch (err) {
        logger.error('Failed to delete user from Ghost', { email, error: err.message });
        return { error: err.message };
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'author'
        });

        // Create user in Ghost CMS (non-blocking)
        createUserInGhost({
            name,
            email,
            password: hashedPassword,
            role: role || 'author'
        }).catch((err) => {
            logger.error('Failed to sync user to Ghost on register', { email, error: err.message });
        });

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            },
            token
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'author'
        });

        // Create user in Ghost CMS (non-blocking)
        const ghostResult = await createUserInGhost({
            name,
            email,
            password: hashedPassword,
            role: role || 'author'
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            ghostSync: ghostResult.created
                ? 'created'
                : ghostResult.exists
                  ? 'already_exists'
                  : 'failed'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            },
            token
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.me = async (req, res) => {
    try {
        // req.user should be set by auth middleware (to be implemented)
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMe = async (req, res) => {
    try {
        const { name, email, password, avatar } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentEmail = user.email;

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (avatar !== undefined) updateData.avatar = avatar;

        let hashedPassword = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
            updateData.password = hashedPassword;
        }

        await user.update(updateData);

        // Sync changes to Ghost
        const ghostUpdateData = {};
        if (name) ghostUpdateData.name = name;
        if (email && email !== currentEmail) ghostUpdateData.newEmail = email;
        if (hashedPassword) ghostUpdateData.password = hashedPassword;

        if (Object.keys(ghostUpdateData).length > 0) {
            updateUserInGhost(currentEmail, ghostUpdateData).catch((err) => {
                logger.error('Failed to sync profile update to Ghost', { error: err.message });
            });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.listUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, email, password, avatar } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentEmail = user.email;

        // Check if another user already has this email
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (avatar !== undefined) updateData.avatar = avatar;

        let hashedPassword = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
            updateData.password = hashedPassword;
        }

        await user.update(updateData);

        // Sync changes to Ghost
        const ghostUpdateData = {};
        if (name) ghostUpdateData.name = name;
        if (email && email !== currentEmail) ghostUpdateData.newEmail = email;
        if (hashedPassword) ghostUpdateData.password = hashedPassword;
        if (role) ghostUpdateData.role = role;

        if (Object.keys(ghostUpdateData).length > 0) {
            const ghostResult = await updateUserInGhost(currentEmail, ghostUpdateData);
            logger.info('Ghost sync result for update', { email: currentEmail, result: ghostResult });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if (req.user.id === id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userEmail = user.email;

        // Delete from local database
        await user.destroy();

        // Delete from Ghost
        const ghostResult = await deleteUserFromGhost(userEmail);
        logger.info('Ghost sync result for delete', { email: userEmail, result: ghostResult });

        res.json({
            message: 'User deleted successfully',
            ghostSync: ghostResult.deleted ? 'deleted' : ghostResult.notFound ? 'not_found' : 'failed'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

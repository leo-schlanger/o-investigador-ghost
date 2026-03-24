const { MediaFolder, Media } = require('../models');

// Build a tree structure from flat folder list
const buildTree = (folders, parentId = null) => {
    return folders
        .filter((f) => f.parentId === parentId)
        .map((folder) => ({
            ...folder.toJSON(),
            children: buildTree(folders, folder.id)
        }));
};

// List all folders (flat or tree)
exports.listFolders = async (req, res) => {
    try {
        const { format = 'tree' } = req.query;

        const folders = await MediaFolder.findAll({
            order: [['name', 'ASC']],
            include: [
                {
                    model: Media,
                    as: 'media',
                    attributes: ['id']
                }
            ]
        });

        // Add media count to each folder
        const foldersWithCount = folders.map((f) => ({
            ...f.toJSON(),
            mediaCount: f.media ? f.media.length : 0,
            media: undefined // Remove media array, keep only count
        }));

        if (format === 'flat') {
            return res.json(foldersWithCount);
        }

        // Build tree structure
        const tree = buildTree(folders);
        const treeWithCount = buildTreeWithCount(tree, foldersWithCount);
        res.json(treeWithCount);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Helper to add media count to tree
const buildTreeWithCount = (tree, flatWithCount) => {
    const countMap = {};
    flatWithCount.forEach((f) => {
        countMap[f.id] = f.mediaCount;
    });

    const addCount = (nodes) => {
        return nodes.map((node) => ({
            ...node,
            mediaCount: countMap[node.id] || 0,
            children: addCount(node.children || [])
        }));
    };

    return addCount(tree);
};

// Create a new folder
exports.createFolder = async (req, res) => {
    try {
        const { name, parentId = null } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Nome da pasta e obrigatorio' });
        }

        // Verify parent exists if provided
        if (parentId) {
            const parent = await MediaFolder.findByPk(parentId);
            if (!parent) {
                return res.status(404).json({ error: 'Pasta pai nao encontrada' });
            }
        }

        const folder = await MediaFolder.create({
            name: name.trim(),
            parentId
        });

        res.status(201).json(folder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update folder (rename)
exports.updateFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, parentId } = req.body;

        const folder = await MediaFolder.findByPk(id);
        if (!folder) {
            return res.status(404).json({ error: 'Pasta nao encontrada' });
        }

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ error: 'Nome da pasta nao pode estar vazio' });
            }
            folder.name = name.trim();
        }

        if (parentId !== undefined) {
            // Prevent circular references
            if (parentId === id) {
                return res.status(400).json({ error: 'Uma pasta nao pode ser pai de si mesma' });
            }

            if (parentId) {
                const parent = await MediaFolder.findByPk(parentId);
                if (!parent) {
                    return res.status(404).json({ error: 'Pasta pai nao encontrada' });
                }

                // Check if the new parent is a descendant of this folder
                const isDescendant = await checkIsDescendant(parentId, id);
                if (isDescendant) {
                    return res
                        .status(400)
                        .json({ error: 'Nao pode mover pasta para dentro de um descendente' });
                }
            }

            folder.parentId = parentId;
        }

        await folder.save();
        res.json(folder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Check if targetId is a descendant of ancestorId
const checkIsDescendant = async (targetId, ancestorId) => {
    const target = await MediaFolder.findByPk(targetId);
    if (!target) return false;
    if (target.parentId === ancestorId) return true;
    if (target.parentId) return checkIsDescendant(target.parentId, ancestorId);
    return false;
};

// Delete folder (moves content to parent)
exports.deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;

        const folder = await MediaFolder.findByPk(id);
        if (!folder) {
            return res.status(404).json({ error: 'Pasta nao encontrada' });
        }

        // Move all media to parent folder (or root if no parent)
        await Media.update({ folderId: folder.parentId }, { where: { folderId: id } });

        // Move all child folders to parent folder
        await MediaFolder.update({ parentId: folder.parentId }, { where: { parentId: id } });

        await folder.destroy();
        res.json({ message: 'Pasta eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

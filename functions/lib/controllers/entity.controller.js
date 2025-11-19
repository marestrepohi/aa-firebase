"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEntity = exports.updateEntity = exports.getEntity = exports.getEntities = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firebase_1 = require("../firebase");
const cors_1 = require("../utils/cors");
const helpers_1 = require("../utils/helpers");
// Get all entities with stats
exports.getEntities = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
        try {
            const [entitiesSnapshot, useCasesSnapshot] = await Promise.all([
                firebase_1.db.collection('entities').get(),
                firebase_1.db.collectionGroup('useCases').get(),
            ]);
            const statsByEntity = await (0, helpers_1.calculateEntityStats)(useCasesSnapshot.docs);
            const entities = entitiesSnapshot.docs.map(doc => {
                const entityData = doc.data();
                const stats = statsByEntity[doc.id] || {
                    active: 0, inactive: 0, strategic: 0, total: 0, scientists: 0, alerts: 0,
                };
                return {
                    id: doc.id,
                    name: entityData.name,
                    description: entityData.description,
                    logo: entityData.logo,
                    stats: {
                        ...stats,
                        inDevelopment: stats.active, // Simplified, adjust as needed
                        totalImpact: 0, // Placeholder, needs real calculation
                    },
                };
            });
            res.json({ success: true, entities });
        }
        catch (error) {
            console.error('Error getting entities:', error);
            res.status(500).json({ success: false, error: 'Failed to get entities' });
        }
    });
});
// Get entity by ID
exports.getEntity = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
        try {
            const entityId = req.query.id;
            if (!entityId) {
                res.status(400).json({ success: false, error: 'Entity ID is required' });
                return;
            }
            const entityDoc = await firebase_1.db.collection('entities').doc(entityId).get();
            if (!entityDoc.exists) {
                res.status(404).json({ success: false, error: 'Entity not found' });
                return;
            }
            const useCasesSnapshot = await firebase_1.db.collection('entities').doc(entityId).collection('useCases').get();
            const statsByEntity = await (0, helpers_1.calculateEntityStats)(useCasesSnapshot.docs);
            const stats = statsByEntity[entityId] || { active: 0, inactive: 0, strategic: 0, total: 0, scientists: 0, alerts: 0 };
            const entityData = entityDoc.data();
            res.json({
                success: true,
                entity: {
                    id: entityDoc.id,
                    name: entityData?.name,
                    description: entityData?.description,
                    logo: entityData?.logo,
                    stats: {
                        ...stats,
                        inDevelopment: stats.active,
                        totalImpact: 0,
                    },
                },
            });
        }
        catch (error) {
            console.error('Error getting entity:', error);
            res.status(500).json({ success: false, error: 'Failed to get entity' });
        }
    });
});
// Update entity
exports.updateEntity = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
        if (req.method !== 'POST' && req.method !== 'PUT') {
            res.status(405).json({ success: false, error: 'Method not allowed' });
            return;
        }
        try {
            const { id, ...entityData } = req.body;
            if (!id) {
                res.status(400).json({ success: false, error: 'Entity ID is required' });
                return;
            }
            const updateData = { ...entityData, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
            await firebase_1.db.collection('entities').doc(id).set(updateData, { merge: true });
            res.json({ success: true, message: 'Entity updated successfully' });
        }
        catch (error) {
            console.error('Error updating entity:', error);
            res.status(500).json({ success: false, error: 'Failed to update entity' });
        }
    });
});
// Delete entity
exports.deleteEntity = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
        if (req.method !== 'DELETE' && req.method !== 'POST') {
            res.status(405).json({ success: false, error: 'Method not allowed' });
            return;
        }
        try {
            const entityId = req.body.id || req.query.id;
            if (!entityId) {
                res.status(400).json({ success: false, error: 'Entity ID is required' });
                return;
            }
            await (0, helpers_1.deleteCollection)(`entities/${entityId}/useCases`, 50);
            await firebase_1.db.collection('entities').doc(entityId).delete();
            res.json({ success: true, message: 'Entity deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting entity:', error);
            res.status(500).json({ success: false, error: 'Failed to delete entity' });
        }
    });
});
//# sourceMappingURL=entity.controller.js.map
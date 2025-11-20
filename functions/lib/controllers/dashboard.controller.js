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
exports.deleteDashboardConfig = exports.getDashboardConfig = exports.saveDashboardConfig = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("../firebase");
const cors_1 = require("../utils/cors");
/**
 * Save dashboard configuration for a use case
 */
exports.saveDashboardConfig = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).json({ success: false, error: 'Method not allowed' });
            return;
        }
        try {
            const { entityId, useCaseId, category, config } = req.body;
            if (!entityId || !useCaseId || !category || !config) {
                res.status(400).json({
                    success: false,
                    error: 'Entity ID, Use Case ID, category, and config are required'
                });
                return;
            }
            // Save to category-specific document
            const configRef = firebase_1.db
                .collection('entities')
                .doc(entityId)
                .collection('useCases')
                .doc(useCaseId)
                .collection('dashboardConfigs')
                .doc(category); // financial, business, or technical
            await configRef.set({
                ...config,
                category,
                updatedAt: new Date().toISOString()
            });
            res.json({
                success: true,
                message: 'Dashboard configuration saved successfully',
                configId: 'current'
            });
        }
        catch (error) {
            console.error('Error saving dashboard config:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to save dashboard configuration'
            });
        }
    });
});
/**
 * Get dashboard configuration for a use case
 */
exports.getDashboardConfig = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
        if (req.method !== 'GET') {
            res.status(405).json({ success: false, error: 'Method not allowed' });
            return;
        }
        try {
            const entityId = req.query.entityId;
            const useCaseId = req.query.useCaseId;
            const category = req.query.category;
            if (!entityId || !useCaseId || !category) {
                res.status(400).json({
                    success: false,
                    error: 'Entity ID, Use Case ID, and category are required'
                });
                return;
            }
            // Get category-specific config
            const configRef = firebase_1.db
                .collection('entities')
                .doc(entityId)
                .collection('useCases')
                .doc(useCaseId)
                .collection('dashboardConfigs')
                .doc(category);
            const configDoc = await configRef.get();
            if (!configDoc.exists) {
                res.json({
                    success: true,
                    config: null,
                    message: 'No dashboard configuration found'
                });
                return;
            }
            res.json({
                success: true,
                config: configDoc.data()
            });
        }
        catch (error) {
            console.error('Error getting dashboard config:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get dashboard configuration'
            });
        }
    });
});
/**
 * Delete dashboard configuration for a use case
 */
exports.deleteDashboardConfig = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
        if (req.method !== 'DELETE' && req.method !== 'POST') {
            res.status(405).json({ success: false, error: 'Method not allowed' });
            return;
        }
        try {
            const { entityId, useCaseId } = req.method === 'DELETE' ? req.query : req.body;
            if (!entityId || !useCaseId) {
                res.status(400).json({
                    success: false,
                    error: 'Entity ID and Use Case ID are required'
                });
                return;
            }
            // Delete from Firestore
            await firebase_1.db
                .collection('entities')
                .doc(entityId)
                .collection('useCases')
                .doc(useCaseId)
                .collection('dashboardConfigs')
                .doc('current')
                .delete();
            res.json({
                success: true,
                message: 'Dashboard configuration deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting dashboard config:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete dashboard configuration'
            });
        }
    });
});
//# sourceMappingURL=dashboard.controller.js.map
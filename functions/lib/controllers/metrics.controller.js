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
exports.getMetricsPeriods = exports.saveMetrics = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("../firebase");
const cors_1 = require("../utils/cors");
// Save metrics for a specific period with versioning
exports.saveMetrics = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
        if (req.method !== 'POST' && req.method !== 'PUT') {
            res.status(405).json({ success: false, error: 'Method not allowed' });
            return;
        }
        try {
            const { entityId, useCaseId, period, metrics, category } = req.body;
            if (!entityId || !useCaseId || !period || !metrics) {
                res.status(400).json({
                    success: false,
                    error: 'Entity ID, Use Case ID, period, and metrics are required'
                });
                return;
            }
            // Determine collection name based on category
            let collectionName = 'metrics'; // Default fallback
            if (category === 'technical')
                collectionName = 'technicalMetrics';
            else if (category === 'business')
                collectionName = 'businessMetrics';
            else if (category === 'financial')
                collectionName = 'financialMetrics';
            else if (category === 'general')
                collectionName = 'generalInfo';
            const metricsRef = firebase_1.db.collection('entities').doc(entityId).collection('useCases').doc(useCaseId).collection(collectionName).doc(period);
            const historyRef = metricsRef.collection('history');
            const timestamp = new Date();
            const versionId = timestamp.toISOString();
            await firebase_1.db.runTransaction(async (transaction) => {
                const currentDoc = await transaction.get(metricsRef);
                if (currentDoc.exists) {
                    const historyData = {
                        ...currentDoc.data(),
                        versionedAt: timestamp,
                    };
                    transaction.set(historyRef.doc(versionId), historyData);
                }
                const saveData = { ...metrics, period, updatedAt: timestamp };
                transaction.set(metricsRef, saveData, { merge: true });
            });
            res.json({ success: true, message: 'Metrics saved successfully with versioning' });
        }
        catch (error) {
            console.error('Error saving metrics:', error);
            res.status(500).json({ success: false, error: 'Failed to save metrics' });
        }
    });
});
// Get metrics for all periods of a use case
exports.getMetricsPeriods = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
        try {
            const { entityId, useCaseId, category } = req.query;
            if (!entityId || !useCaseId) {
                res.status(400).json({
                    success: false,
                    error: 'Entity ID and Use Case ID are required'
                });
                return;
            }
            // Determine collection name based on category
            let collectionName = 'metrics'; // Default fallback
            if (category === 'technical')
                collectionName = 'technicalMetrics';
            else if (category === 'business')
                collectionName = 'businessMetrics';
            else if (category === 'financial')
                collectionName = 'financialMetrics';
            else if (category === 'general')
                collectionName = 'generalInfo';
            const metricsSnapshot = await firebase_1.db
                .collection('entities')
                .doc(entityId)
                .collection('useCases')
                .doc(useCaseId)
                .collection(collectionName)
                .orderBy('period', 'desc')
                .get();
            const periods = metricsSnapshot.docs.map(doc => ({
                period: doc.id,
                ...doc.data(),
            }));
            res.json({ success: true, periods });
        }
        catch (error) {
            console.error('Error getting metrics periods:', error);
            res.status(500).json({ success: false, error: 'Failed to get metrics periods' });
        }
    });
});
//# sourceMappingURL=metrics.controller.js.map
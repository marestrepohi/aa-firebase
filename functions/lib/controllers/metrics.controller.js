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
exports.getMetric = exports.getMetricsHistory = exports.saveMetrics = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("../firebase");
const cors_1 = require("../utils/cors");
// Save metrics with timestamp-based ID (no period)
exports.saveMetrics = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
        if (req.method !== 'POST' && req.method !== 'PUT') {
            res.status(405).json({ success: false, error: 'Method not allowed' });
            return;
        }
        try {
            const { entityId, useCaseId, metrics, category } = req.body;
            if (!entityId || !useCaseId || !metrics) {
                res.status(400).json({
                    success: false,
                    error: 'Entity ID, Use Case ID, and metrics are required'
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
            const timestamp = new Date();
            const docId = timestamp.toISOString(); // Use timestamp as Document ID
            const metricsRef = firebase_1.db.collection('entities').doc(entityId).collection('useCases').doc(useCaseId).collection(collectionName).doc(docId);
            const saveData = {
                ...metrics,
                uploadedAt: timestamp
            };
            await metricsRef.set(saveData);
            res.json({ success: true, message: 'Metrics saved successfully', id: docId });
        }
        catch (error) {
            console.error('Error saving metrics:', error);
            res.status(500).json({ success: false, error: 'Failed to save metrics' });
        }
    });
});
// Get metrics history (sorted by date desc)
exports.getMetricsHistory = functions.https.onRequest((req, res) => {
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
                .orderBy('uploadedAt', 'desc') // Sort by upload time
                .get();
            const history = metricsSnapshot.docs.map(doc => {
                const { data, ...rest } = doc.data(); // Exclude 'data' field (raw CSV)
                return {
                    id: doc.id,
                    ...rest,
                    uploadedAt: rest.uploadedAt?.toDate()?.toISOString()
                };
            });
            res.json({ success: true, history });
        }
        catch (error) {
            console.error('Error getting metrics history:', error);
            res.status(500).json({ success: false, error: 'Failed to get metrics history' });
        }
    });
});
// Get a specific metric by ID
exports.getMetric = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
        try {
            const { entityId, useCaseId, category, metricId } = req.query;
            if (!entityId || !useCaseId || !category || !metricId) {
                res.status(400).json({ success: false, error: 'Entity ID, Use Case ID, Category, and Metric ID are required' });
                return;
            }
            let collectionName = '';
            if (category === 'technical')
                collectionName = 'technicalMetrics';
            else if (category === 'business')
                collectionName = 'businessMetrics';
            else if (category === 'financial')
                collectionName = 'financialMetrics';
            else if (category === 'general')
                collectionName = 'generalInfo';
            else {
                res.status(400).json({ success: false, error: 'Invalid category' });
                return;
            }
            const doc = await firebase_1.db
                .collection('entities')
                .doc(entityId)
                .collection('useCases')
                .doc(useCaseId)
                .collection(collectionName)
                .doc(metricId)
                .get();
            if (!doc.exists) {
                res.status(404).json({ success: false, error: 'Metric not found' });
                return;
            }
            res.json({ success: true, metric: { id: doc.id, ...doc.data() } });
        }
        catch (error) {
            console.error('Error getting metric:', error);
            res.status(500).json({ success: false, error: 'Failed to get metric' });
        }
    });
});
//# sourceMappingURL=metrics.controller.js.map
import * as functions from 'firebase-functions';
import { db } from '../firebase';
import { corsHandler } from '../utils/cors';

/**
 * Save dashboard configuration for a use case
 */
export const saveDashboardConfig = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
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
            const configRef = db
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
        } catch (error) {
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
export const getDashboardConfig = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'GET') {
            res.status(405).json({ success: false, error: 'Method not allowed' });
            return;
        }

        try {
            const entityId = req.query.entityId as string;
            const useCaseId = req.query.useCaseId as string;
            const category = req.query.category as string;

            if (!entityId || !useCaseId || !category) {
                res.status(400).json({
                    success: false,
                    error: 'Entity ID, Use Case ID, and category are required'
                });
                return;
            }

            // Get category-specific config
            const configRef = db
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
        } catch (error) {
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
export const deleteDashboardConfig = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
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
            await db
                .collection('entities')
                .doc(entityId as string)
                .collection('useCases')
                .doc(useCaseId as string)
                .collection('dashboardConfigs')
                .doc('current')
                .delete();

            res.json({
                success: true,
                message: 'Dashboard configuration deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting dashboard config:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete dashboard configuration'
            });
        }
    });
});

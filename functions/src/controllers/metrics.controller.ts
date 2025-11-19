import * as functions from 'firebase-functions';
import { db } from '../firebase';
import { corsHandler } from '../utils/cors';

// Save metrics for a specific period with versioning
export const saveMetrics = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
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
            if (category === 'technical') collectionName = 'technicalMetrics';
            else if (category === 'business') collectionName = 'businessMetrics';
            else if (category === 'financial') collectionName = 'financialMetrics';
            else if (category === 'general') collectionName = 'generalInfo';

            const metricsRef = db.collection('entities').doc(entityId).collection('useCases').doc(useCaseId).collection(collectionName).doc(period);
            const historyRef = metricsRef.collection('history');

            const timestamp = new Date();
            const versionId = timestamp.toISOString();

            await db.runTransaction(async (transaction) => {
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
        } catch (error) {
            console.error('Error saving metrics:', error);
            res.status(500).json({ success: false, error: 'Failed to save metrics' });
        }
    });
});

// Get metrics for all periods of a use case
export const getMetricsPeriods = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
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
            if (category === 'technical') collectionName = 'technicalMetrics';
            else if (category === 'business') collectionName = 'businessMetrics';
            else if (category === 'financial') collectionName = 'financialMetrics';
            else if (category === 'general') collectionName = 'generalInfo';

            const metricsSnapshot = await db
                .collection('entities')
                .doc(entityId as string)
                .collection('useCases')
                .doc(useCaseId as string)
                .collection(collectionName)
                .orderBy('period', 'desc')
                .get();
            const periods = metricsSnapshot.docs.map(doc => ({
                period: doc.id,
                ...doc.data(),
            }));
            res.json({ success: true, periods });
        } catch (error) {
            console.error('Error getting metrics periods:', error);
            res.status(500).json({ success: false, error: 'Failed to get metrics periods' });
        }
    });
});

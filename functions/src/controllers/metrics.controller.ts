import * as functions from 'firebase-functions';
import { db } from '../firebase';
import { corsHandler } from '../utils/cors';

// Save metrics with timestamp-based ID (no period)
export const saveMetrics = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
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
            if (category === 'technical') collectionName = 'technicalMetrics';
            else if (category === 'business') collectionName = 'businessMetrics';
            else if (category === 'financial') collectionName = 'financialMetrics';
            else if (category === 'general') collectionName = 'generalInfo';

            const timestamp = new Date();
            const docId = timestamp.toISOString(); // Use timestamp as Document ID

            const metricsRef = db.collection('entities').doc(entityId).collection('useCases').doc(useCaseId).collection(collectionName).doc(docId);

            const saveData = {
                ...metrics,
                uploadedAt: timestamp
            };

            await metricsRef.set(saveData);

            res.json({ success: true, message: 'Metrics saved successfully', id: docId });
        } catch (error) {
            console.error('Error saving metrics:', error);
            res.status(500).json({ success: false, error: 'Failed to save metrics' });
        }
    });
});

// Get metrics history (sorted by date desc)
export const getMetricsHistory = functions.https.onRequest((req, res) => {
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
        } catch (error) {
            console.error('Error getting metrics history:', error);
            res.status(500).json({ success: false, error: 'Failed to get metrics history' });
        }
    });
});

// Get a specific metric by ID
export const getMetric = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const { entityId, useCaseId, category, metricId } = req.query;

            if (!entityId || !useCaseId || !category || !metricId) {
                res.status(400).json({ success: false, error: 'Entity ID, Use Case ID, Category, and Metric ID are required' });
                return;
            }

            let collectionName = '';
            if (category === 'technical') collectionName = 'technicalMetrics';
            else if (category === 'business') collectionName = 'businessMetrics';
            else if (category === 'financial') collectionName = 'financialMetrics';
            else if (category === 'general') collectionName = 'generalInfo';
            else {
                res.status(400).json({ success: false, error: 'Invalid category' });
                return;
            }

            const doc = await db
                .collection('entities')
                .doc(entityId as string)
                .collection('useCases')
                .doc(useCaseId as string)
                .collection(collectionName)
                .doc(metricId as string)
                .get();

            if (!doc.exists) {
                res.status(404).json({ success: false, error: 'Metric not found' });
                return;
            }

            res.json({ success: true, metric: { id: doc.id, ...doc.data() } });

        } catch (error) {
            console.error('Error getting metric:', error);
            res.status(500).json({ success: false, error: 'Failed to get metric' });
        }
    });
});

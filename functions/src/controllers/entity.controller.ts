import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db } from '../firebase';
import { corsHandler } from '../utils/cors';
import { calculateEntityStats, deleteCollection } from '../utils/helpers';

// Get all entities with stats
export const getEntities = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const [entitiesSnapshot, useCasesSnapshot] = await Promise.all([
                db.collection('entities').get(),
                db.collectionGroup('useCases').get(),
            ]);

            const statsByEntity = await calculateEntityStats(useCasesSnapshot.docs);

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
        } catch (error) {
            console.error('Error getting entities:', error);
            res.status(500).json({ success: false, error: 'Failed to get entities' });
        }
    });
});

// Get entity by ID
export const getEntity = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const entityId = req.query.id as string;
            if (!entityId) {
                res.status(400).json({ success: false, error: 'Entity ID is required' });
                return;
            }

            const entityDoc = await db.collection('entities').doc(entityId).get();
            if (!entityDoc.exists) {
                res.status(404).json({ success: false, error: 'Entity not found' });
                return;
            }

            const useCasesSnapshot = await db.collection('entities').doc(entityId).collection('useCases').get();
            const statsByEntity = await calculateEntityStats(useCasesSnapshot.docs);
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
        } catch (error) {
            console.error('Error getting entity:', error);
            res.status(500).json({ success: false, error: 'Failed to get entity' });
        }
    });
});

// Update entity
export const updateEntity = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
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
            await db.collection('entities').doc(id).set(updateData, { merge: true });
            res.json({ success: true, message: 'Entity updated successfully' });
        } catch (error) {
            console.error('Error updating entity:', error);
            res.status(500).json({ success: false, error: 'Failed to update entity' });
        }
    });
});

// Delete entity
export const deleteEntity = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
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
            await deleteCollection(`entities/${entityId}/useCases`, 50);
            await db.collection('entities').doc(entityId).delete();
            res.json({ success: true, message: 'Entity deleted successfully' });
        } catch (error) {
            console.error('Error deleting entity:', error);
            res.status(500).json({ success: false, error: 'Failed to delete entity' });
        }
    });
});

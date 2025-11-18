import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// CORS configuration
const corsHandler = cors({ origin: true });

// Helper function to calculate entity stats efficiently
async function calculateEntityStats(allUseCases: admin.firestore.QueryDocumentSnapshot[]): Promise<Record<string, any>> {
  const statsByEntity: Record<string, any> = {};

  const metricsPromises = allUseCases.map(doc => 
    doc.ref.collection('metrics').orderBy('period', 'desc').limit(1).get()
  );
  const metricsSnapshots = await Promise.all(metricsPromises);

  allUseCases.forEach((doc, index) => {
    const useCase = doc.data();
    const entityId = useCase.entityId;

    if (!statsByEntity[entityId]) {
      statsByEntity[entityId] = {
        active: 0,
        inactive: 0,
        strategic: 0,
        total: 0,
        scientists: 0,
        alerts: 0,
      };
    }

    const stats = statsByEntity[entityId];
    stats.total++;

    const status = useCase.highLevelStatus || '';
    if (status === 'Activo') stats.active++;
    else if (status === 'Inactivo') stats.inactive++;
    else if (status === 'Estrategico') stats.strategic++;

    const metricsSnapshot = metricsSnapshots[index];
    if (!metricsSnapshot.empty) {
      const metrics = metricsSnapshot.docs[0].data();
      const dsMetrics = metrics.technical?.filter((m: any) => m.label.startsWith('DS') && m.value);
      if (dsMetrics) {
        stats.scientists += dsMetrics.length;
      }
    }
    
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    if (useCase.updatedAt?.toDate() < threeMonthsAgo) {
      stats.alerts++;
    }
  });

  return statsByEntity;
}

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

// Get use cases for an entity
export const getUseCases = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const entityId = req.query.entityId as string;
      if (!entityId) {
        res.status(400).json({ success: false, error: 'Entity ID is required' });
        return;
      }

      const useCasesSnapshot = await db
        .collection('entities')
        .doc(entityId)
        .collection('useCases')
        .get();

      const useCases = await Promise.all(useCasesSnapshot.docs.map(async (doc) => {
        const useCaseData = doc.data();
        const metricsSnapshot = await doc.ref
          .collection('metrics')
          .orderBy('period', 'desc')
          .limit(1)
          .get();

        let metrics = { period: '', general: [], financial: [], business: [], technical: [] };
        if (!metricsSnapshot.empty) {
          metrics = metricsSnapshot.docs[0].data() as any;
        }

        return {
          id: doc.id,
          ...useCaseData,
          metrics,
        };
      }));

      res.json({ success: true, useCases });
    } catch (error) {
      console.error('Error getting use cases:', error);
      res.status(500).json({ success: false, error: 'Failed to get use cases' });
    }
  });
});

// Get a single use case by entity and use case ID
export const getUseCase = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const entityId = req.query.entityId as string;
      const useCaseId = req.query.useCaseId as string;
      
      if (!entityId || !useCaseId) {
        res.status(400).json({ success: false, error: 'Entity ID and Use Case ID are required' });
        return;
      }

      const useCaseDoc = await db
        .collection('entities')
        .doc(entityId)
        .collection('useCases')
        .doc(useCaseId)
        .get();

      if (!useCaseDoc.exists) {
        res.status(404).json({ success: false, error: 'Use case not found' });
        return;
      }

      const useCaseData = useCaseDoc.data()!;
      const metricsSnapshot = await useCaseDoc.ref
        .collection('metrics')
        .orderBy('period', 'desc')
        .limit(1)
        .get();

      let metrics = { 
        period: '',
        general: [], 
        financial: [], 
        business: [], 
        technical: [] 
      };
      
      if (!metricsSnapshot.empty) {
        metrics = metricsSnapshot.docs[0].data() as any;
      }

      const useCase = {
        id: useCaseDoc.id,
        ...useCaseData,
        lastUpdated: useCaseData.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
        metrics,
      };

      res.json({ success: true, useCase });
    } catch (error) {
      console.error('Error getting use case:', error);
      res.status(500).json({ success: false, error: 'Failed to get use case' });
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

// Update use case with versioning
export const updateUseCase = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST' && req.method !== 'PUT') {
            res.status(405).json({ success: false, error: 'Method not allowed' });
            return;
        }

        try {
            const { entityId, id, newUploadedFiles, ...useCaseData } = req.body;
            if (!entityId || !id) {
                res.status(400).json({ success: false, error: 'Entity ID and Use Case ID are required' });
                return;
            }

            const useCaseRef = db.collection('entities').doc(entityId).collection('useCases').doc(id);
            const historyRef = useCaseRef.collection('history');
            
            const timestamp = new Date();
            const versionId = timestamp.toISOString();

            await db.runTransaction(async (transaction) => {
                const currentDoc = await transaction.get(useCaseRef);
                if (currentDoc.exists) {
                    const historyData = {
                        ...currentDoc.data(),
                        versionedAt: timestamp,
                    };
                    transaction.set(historyRef.doc(versionId), historyData);
                }

                const updateData = { 
                    ...useCaseData, 
                    updatedAt: timestamp 
                };
                
                transaction.set(useCaseRef, updateData, { merge: true });
                
                if (newUploadedFiles && Array.isArray(newUploadedFiles)) {
                    for (const file of newUploadedFiles) {
                        const fileRef = useCaseRef.collection('uploadedFiles').doc(file.id);
                        transaction.set(fileRef, {
                            ...file,
                            uploadedAt: timestamp
                        });
                    }
                }
            });

            res.json({ success: true, message: 'Use case updated successfully with versioning' });
        } catch (error) {
            console.error('Error updating use case:', error);
            res.status(500).json({ success: false, error: 'Failed to update use case' });
        }
    });
});


// Save metrics for a specific period with versioning
export const saveMetrics = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST' && req.method !== 'PUT') {
            res.status(405).json({ success: false, error: 'Method not allowed' });
            return;
        }

        try {
            const { entityId, useCaseId, period, metrics } = req.body;
            if (!entityId || !useCaseId || !period || !metrics) {
                res.status(400).json({
                    success: false,
                    error: 'Entity ID, Use Case ID, period, and metrics are required'
                });
                return;
            }
            
            const metricsRef = db.collection('entities').doc(entityId).collection('useCases').doc(useCaseId).collection('metrics').doc(period);
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
      const { entityId, useCaseId } = req.query;
      if (!entityId || !useCaseId) {
        res.status(400).json({ 
          success: false, 
          error: 'Entity ID and Use Case ID are required' 
        });
        return;
      }
      const metricsSnapshot = await db
        .collection('entities')
        .doc(entityId as string)
        .collection('useCases')
        .doc(useCaseId as string)
        .collection('metrics')
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

// Helper function for deep deletion
async function deleteCollection(collectionPath: string, batchSize: number) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(query: FirebaseFirestore.Query, resolve: (value?: unknown) => void) {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
        resolve();
        return;
    }

    const batch = db.batch();
    for (const doc of snapshot.docs) {
        // Recursively delete subcollections
        const subcollections = await doc.ref.listCollections();
        for (const subcollection of subcollections) {
            await deleteCollection(`${doc.ref.path}/${subcollection.id}`, 50);
        }
        batch.delete(doc.ref);
    }
    
    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(query, resolve);
    });
}


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

// Delete use case
export const deleteUseCase = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'DELETE' && req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }
    try {
      const entityId = req.body.entityId || req.query.entityId;
      const useCaseId = req.body.id || req.query.id;
      if (!entityId || !useCaseId) {
        res.status(400).json({ success: false, error: 'Entity ID and Use Case ID are required' });
        return;
      }
      // This will also delete the 'history' sub-subcollections
      await deleteCollection(`entities/${entityId}/useCases/${useCaseId}/metrics`, 50);
      await deleteCollection(`entities/${entityId}/useCases/${useCaseId}/history`, 50);
      await db.collection('entities').doc(entityId).collection('useCases').doc(useCaseId).delete();
      res.json({ success: true, message: 'Use case deleted successfully' });
    } catch (error) {
      console.error('Error deleting use case:', error);
      res.status(500).json({ success: false, error: 'Failed to delete use case' });
    }
  });
});

export const revertUseCaseVersion = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).json({ success: false, error: 'Method not allowed' });
            return;
        }

        try {
            const { entityId, useCaseId, versionId } = req.body;
            if (!entityId || !useCaseId || !versionId) {
                res.status(400).json({ success: false, error: 'Entity ID, Use Case ID, and Version ID are required' });
                return;
            }

            const useCaseRef = db.collection('entities').doc(entityId).collection('useCases').doc(useCaseId);
            const historyDocRef = useCaseRef.collection('history').doc(versionId);

            const historyDoc = await historyDocRef.get();
            if (!historyDoc.exists) {
                res.status(404).json({ success: false, error: 'History version not found' });
                return;
            }
            
            const versionData = historyDoc.data()!;
            
            // The version data contains a 'versionedAt' field which we don't want in the main doc
            const { versionedAt, ...revertData } = versionData;

            // Update the main document with the historical data
            await useCaseRef.set({
                ...revertData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Set a new update timestamp
                lastRevertedFrom: versionId, // Optional: track the revert operation
            }, { merge: true });

            res.json({ success: true, message: `Use case reverted to version ${versionId}` });

        } catch (error) {
            console.error('Error reverting use case version:', error);
            res.status(500).json({ success: false, error: 'Failed to revert use case version' });
        }
    });
});

export const getUseCaseHistory = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const { entityId, useCaseId } = req.query;
            if (!entityId || !useCaseId) {
                res.status(400).json({ success: false, error: 'Entity ID and Use Case ID are required' });
                return;
            }

            const historySnapshot = await db
                .collection('entities')
                .doc(entityId as string)
                .collection('useCases')
                .doc(useCaseId as string)
                .collection('history')
                .orderBy('versionedAt', 'desc')
                .get();
            
            const history = historySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    versionId: doc.id,
                    versionedAt: data.versionedAt.toDate().toISOString(),
                    // You can add more fields here if needed, like who made the change
                };
            });

            res.json({ success: true, history });

        } catch (error) {
            console.error('Error getting use case history:', error);
            res.status(500).json({ success: false, error: 'Failed to get use case history' });
        }
    });
});

export const deleteUploadedFile = functions.https.onCall(async (data, context) => {
    const { entityId, useCaseId, fileId } = data;

    if (!entityId || !useCaseId || !fileId) {
        throw new functions.https.HttpsError('invalid-argument', 'Entity ID, Use Case ID, and File ID are required.');
    }

    const useCaseRef = db.collection('entities').doc(entityId).collection('useCases').doc(useCaseId);
    const fileRef = useCaseRef.collection('uploadedFiles').doc(fileId);

    try {
        await db.runTransaction(async (transaction) => {
            const fileDoc = await transaction.get(fileRef);
            if (!fileDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Uploaded file not found.');
            }
            
            const fileData = fileDoc.data()!;
            const category = fileData.category;
            const filePeriods = fileData.periods || [];

            const currentUseCaseDoc = await transaction.get(useCaseRef);
            const currentUseCaseData = currentUseCaseDoc.data();
            const currentMetrics = currentUseCaseData?.metrics || {};
            
            const newMetrics = { ...currentMetrics };
            let hasChanges = false;
            
            // Remove metrics associated with the file's periods
            for (const period of filePeriods) {
                if (newMetrics[period]?.[category]?.fileId === fileId) {
                    delete newMetrics[period][category];
                    if(Object.keys(newMetrics[period]).length === 0){
                        delete newMetrics[period];
                    }
                    hasChanges = true;
                }
            }
            
            if (hasChanges) {
                transaction.update(useCaseRef, { metrics: newMetrics });
            }

            transaction.delete(fileRef);
        });

        return { success: true, message: 'File and associated metrics deleted successfully.' };
    } catch (error) {
        console.error('Error deleting uploaded file:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'An unexpected error occurred while deleting the file.');
    }
});

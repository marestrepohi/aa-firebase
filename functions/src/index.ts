import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// CORS configuration
const corsHandler = cors({ origin: true });

// Helper function to calculate entity stats
async function calculateEntityStats(entityId: string) {
  const useCasesSnapshot = await db
    .collection('entities')
    .doc(entityId)
    .collection('useCases')
    .get();

  let active = 0;
  let inactive = 0;
  let strategic = 0;
  let totalDS = 0;
  let alerts = 0;

  for (const doc of useCasesSnapshot.docs) {
    const useCase = doc.data();
    const status = useCase.highLevelStatus || '';

    if (status === 'Activo') active++;
    else if (status === 'Inactivo') inactive++;
    else if (status === 'Estrategico') strategic++;

    // Get latest metrics for DS count
    const metricsSnapshot = await doc.ref
      .collection('metrics')
      .orderBy('period', 'desc')
      .limit(1)
      .get();

    if (!metricsSnapshot.empty) {
      const metrics = metricsSnapshot.docs[0].data();
      const dsMetric = metrics.general?.find((m: any) => m.label === 'Cantidad de DS');
      if (dsMetric?.value) {
        const dsCount = parseInt(dsMetric.value) || 0;
        totalDS += dsCount;
      }
    }

    // Check for alerts (simple logic: projects without recent metrics)
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    
    if (useCase.updatedAt?.toDate() < threeMonthsAgo) {
      alerts++;
    }
  }

  return {
    active,
    inactive,
    strategic,
    total: useCasesSnapshot.size,
    scientists: totalDS,
    inDevelopment: active, // Simplified
    alerts,
    totalImpact: 0, // Will be calculated from metrics
  };
}

// Get all entities with stats
export const getEntities = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const entitiesSnapshot = await db.collection('entities').get();
      const entities = [];

      for (const doc of entitiesSnapshot.docs) {
        const entityData = doc.data();
        const stats = await calculateEntityStats(doc.id);

        entities.push({
          id: doc.id,
          name: entityData.name,
          description: entityData.description,
          logo: entityData.logo,
          stats,
        });
      }

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

      const entityData = entityDoc.data();
      const stats = await calculateEntityStats(entityId);

      res.json({
        success: true,
        entity: {
          id: entityDoc.id,
          name: entityData?.name,
          description: entityData?.description,
          logo: entityData?.logo,
          stats,
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

      const useCases = [];

      for (const doc of useCasesSnapshot.docs) {
        const useCaseData = doc.data();

        // Get latest metrics
        const metricsSnapshot = await doc.ref
          .collection('metrics')
          .orderBy('period', 'desc')
          .limit(1)
          .get();

        let metrics = { general: [], financial: [], business: [], technical: [] };
        if (!metricsSnapshot.empty) {
          metrics = metricsSnapshot.docs[0].data() as any;
        }

        useCases.push({
          id: doc.id,
          entityId: useCaseData.entityId,
          name: useCaseData.name,
          description: useCaseData.description,
          status: useCaseData.status,
          highLevelStatus: useCaseData.highLevelStatus,
          tipoProyecto: useCaseData.tipoProyecto,
          tipoDesarrollo: useCaseData.tipoDesarrollo,
          observaciones: useCaseData.observaciones,
          sharepoint: useCaseData.sharepoint,
          jira: useCaseData.jira,
          actividadesSharepoint: useCaseData.actividadesSharepoint,
          actividadesJira: useCaseData.actividadesJira,
          metrics,
        });
      }

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

      // Get latest metrics
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
        entityId: useCaseData.entityId,
        name: useCaseData.name,
        description: useCaseData.description,
        status: useCaseData.status,
        highLevelStatus: useCaseData.highLevelStatus,
        tipoProyecto: useCaseData.tipoProyecto,
        tipoDesarrollo: useCaseData.tipoDesarrollo,
        observaciones: useCaseData.observaciones,
        sharepoint: useCaseData.sharepoint,
        jira: useCaseData.jira,
        actividadesSharepoint: useCaseData.actividadesSharepoint,
        actividadesJira: useCaseData.actividadesJira,
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
      const { id, name, description, logo } = req.body;

      if (!id) {
        res.status(400).json({ success: false, error: 'Entity ID is required' });
        return;
      }

      const entityRef = db.collection('entities').doc(id);
      const entityDoc = await entityRef.get();

      const updateData: any = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (logo !== undefined) updateData.logo = logo;

      if (entityDoc.exists) {
        await entityRef.update(updateData);
      } else {
        updateData.id = id;
        updateData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        await entityRef.set(updateData);
      }

      res.json({ success: true, message: 'Entity updated successfully' });
    } catch (error) {
      console.error('Error updating entity:', error);
      res.status(500).json({ success: false, error: 'Failed to update entity' });
    }
  });
});

// Update use case
export const updateUseCase = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST' && req.method !== 'PUT') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    try {
      const { entityId, id, ...useCaseData } = req.body;

      if (!entityId || !id) {
        res.status(400).json({ success: false, error: 'Entity ID and Use Case ID are required' });
        return;
      }

      const useCaseRef = db.collection('entities').doc(entityId).collection('useCases').doc(id);
      const useCaseDoc = await useCaseRef.get();

      const updateData: any = {
        ...useCaseData,
        entityId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (useCaseDoc.exists) {
        await useCaseRef.update(updateData);
      } else {
        updateData.id = id;
        updateData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        await useCaseRef.set(updateData);
      }

      res.json({ success: true, message: 'Use case updated successfully' });
    } catch (error) {
      console.error('Error updating use case:', error);
      res.status(500).json({ success: false, error: 'Failed to update use case' });
    }
  });
});

// Save metrics for a specific period
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

      const metricsRef = db
        .collection('entities')
        .doc(entityId)
        .collection('useCases')
        .doc(useCaseId)
        .collection('metrics')
        .doc(period);

      const metricsDoc = await metricsRef.get();

      const saveData = {
        period,
        ...metrics,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (metricsDoc.exists) {
        await metricsRef.update(saveData);
      } else {
        saveData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        await metricsRef.set(saveData);
      }

      res.json({ success: true, message: 'Metrics saved successfully' });
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

      // Delete all use cases and their metrics first
      const useCasesSnapshot = await db
        .collection('entities')
        .doc(entityId as string)
        .collection('useCases')
        .get();

      const batch = db.batch();
      
      for (const useCaseDoc of useCasesSnapshot.docs) {
        // Delete all metrics
        const metricsSnapshot = await useCaseDoc.ref.collection('metrics').get();
        metricsSnapshot.docs.forEach(metricDoc => {
          batch.delete(metricDoc.ref);
        });
        
        // Delete use case
        batch.delete(useCaseDoc.ref);
      }

      // Delete entity
      batch.delete(db.collection('entities').doc(entityId as string));

      await batch.commit();

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
        res.status(400).json({ 
          success: false, 
          error: 'Entity ID and Use Case ID are required' 
        });
        return;
      }

      const useCaseRef = db
        .collection('entities')
        .doc(entityId as string)
        .collection('useCases')
        .doc(useCaseId as string);

      // Delete all metrics
      const metricsSnapshot = await useCaseRef.collection('metrics').get();
      const batch = db.batch();
      
      metricsSnapshot.docs.forEach(metricDoc => {
        batch.delete(metricDoc.ref);
      });

      // Delete use case
      batch.delete(useCaseRef);

      await batch.commit();

      res.json({ success: true, message: 'Use case deleted successfully' });
    } catch (error) {
      console.error('Error deleting use case:', error);
      res.status(500).json({ success: false, error: 'Failed to delete use case' });
    }
  });
});

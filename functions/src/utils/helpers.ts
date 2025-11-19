import * as admin from 'firebase-admin';
import { db } from '../firebase';

// Helper function to calculate entity stats efficiently
export async function calculateEntityStats(allUseCases: admin.firestore.QueryDocumentSnapshot[]): Promise<Record<string, any>> {
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

// Helper function for deep deletion
export async function deleteCollection(collectionPath: string, batchSize: number) {
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

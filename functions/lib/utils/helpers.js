"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateEntityStats = calculateEntityStats;
exports.deleteCollection = deleteCollection;
const firebase_1 = require("../firebase");
// Helper function to calculate entity stats efficiently
async function calculateEntityStats(allUseCases) {
    const statsByEntity = {};
    allUseCases.forEach((doc) => {
        const useCase = doc.data();
        const entityId = useCase.entityId;
        if (!statsByEntity[entityId]) {
            statsByEntity[entityId] = {
                active: 0,
                inactive: 0,
                strategic: 0,
                total: 0,
                alerts: 0,
            };
        }
        const stats = statsByEntity[entityId];
        stats.total++;
        const status = useCase.highLevelStatus || '';
        if (status === 'Activo')
            stats.active++;
        else if (status === 'Inactivo')
            stats.inactive++;
        else if (status === 'Estrategico')
            stats.strategic++;
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        if (useCase.updatedAt?.toDate() < threeMonthsAgo) {
            stats.alerts++;
        }
    });
    return statsByEntity;
}
// Helper function for deep deletion
async function deleteCollection(collectionPath, batchSize) {
    const collectionRef = firebase_1.db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);
    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve).catch(reject);
    });
}
async function deleteQueryBatch(query, resolve) {
    const snapshot = await query.get();
    if (snapshot.size === 0) {
        resolve();
        return;
    }
    const batch = firebase_1.db.batch();
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
//# sourceMappingURL=helpers.js.map
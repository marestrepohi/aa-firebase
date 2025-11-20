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
exports.deleteUploadedFile = exports.getUseCaseHistory = exports.revertUseCaseVersion = exports.deleteUseCase = exports.updateUseCase = exports.getUseCase = exports.getUseCases = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firebase_1 = require("../firebase");
const cors_1 = require("../utils/cors");
const helpers_1 = require("../utils/helpers");
// Get use cases for an entity
exports.getUseCases = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
        try {
            const entityId = req.query.entityId;
            if (!entityId) {
                res.status(400).json({ success: false, error: 'Entity ID is required' });
                return;
            }
            const useCasesSnapshot = await firebase_1.db
                .collection('entities')
                .doc(entityId)
                .collection('useCases')
                .get();
            const useCases = useCasesSnapshot.docs.map((doc) => {
                return {
                    id: doc.id,
                    ...doc.data(),
                };
            });
            res.json({ success: true, useCases });
        }
        catch (error) {
            console.error('Error getting use cases:', error);
            res.status(500).json({ success: false, error: 'Failed to get use cases' });
        }
    });
});
// Get a single use case by entity and use case ID
exports.getUseCase = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
        try {
            const entityId = req.query.entityId;
            const useCaseId = req.query.useCaseId;
            if (!entityId || !useCaseId) {
                res.status(400).json({ success: false, error: 'Entity ID and Use Case ID are required' });
                return;
            }
            const useCaseDoc = await firebase_1.db
                .collection('entities')
                .doc(entityId)
                .collection('useCases')
                .doc(useCaseId)
                .get();
            if (!useCaseDoc.exists) {
                res.status(404).json({ success: false, error: 'Use case not found' });
                return;
            }
            const useCaseData = useCaseDoc.data();
            // Fetch uploaded files
            const uploadedFilesSnapshot = await useCaseDoc.ref.collection('uploadedFiles').orderBy('uploadedAt', 'desc').get();
            const uploadedFiles = uploadedFilesSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    uploadedAt: data.uploadedAt?.toDate()?.toISOString()
                };
            });
            // Fetch latest metrics from all categories (order by uploadedAt)
            const [techSnapshot, busSnapshot, finSnapshot, genSnapshot] = await Promise.all([
                useCaseDoc.ref.collection('technicalMetrics').orderBy('uploadedAt', 'desc').limit(1).get(),
                useCaseDoc.ref.collection('businessMetrics').orderBy('uploadedAt', 'desc').limit(1).get(),
                useCaseDoc.ref.collection('financialMetrics').orderBy('uploadedAt', 'desc').limit(1).get(),
                useCaseDoc.ref.collection('generalInfo').orderBy('uploadedAt', 'desc').limit(1).get()
            ]);
            let metrics = {
                general: [],
                financial: [],
                business: [],
                technical: []
            };
            // Helper to merge metrics (no period tracking)
            const mergeMetrics = (snapshot) => {
                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data();
                    metrics = { ...metrics, ...data };
                }
            };
            mergeMetrics(techSnapshot);
            mergeMetrics(busSnapshot);
            mergeMetrics(finSnapshot);
            mergeMetrics(genSnapshot);
            const useCase = {
                id: useCaseDoc.id,
                ...useCaseData,
                lastUpdated: useCaseData.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
                metrics,
                uploadedFiles,
            };
            res.json({ success: true, useCase });
        }
        catch (error) {
            console.error('Error getting use case:', error);
            res.status(500).json({ success: false, error: 'Failed to get use case' });
        }
    });
});
// Update use case with versioning
exports.updateUseCase = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
        if (req.method !== 'POST' && req.method !== 'PUT') {
            res.status(405).json({ success: false, error: 'Method not allowed' });
            return;
        }
        try {
            const { entityId, id, newUploadedFiles, metrics, ...useCaseData } = req.body;
            if (!entityId || !id) {
                res.status(400).json({ success: false, error: 'Entity ID and Use Case ID are required' });
                return;
            }
            const useCaseRef = firebase_1.db.collection('entities').doc(entityId).collection('useCases').doc(id);
            const historyRef = useCaseRef.collection('history');
            const timestamp = new Date();
            const versionId = timestamp.toISOString();
            await firebase_1.db.runTransaction(async (transaction) => {
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
                // NOTE: Metrics are saved via saveMetrics function only.
                // This updateUseCase function is ONLY for use case metadata, not metrics.
                // Save general info snapshot to generalInfo subcollection
                // This ensures that edits to general info are tracked as history
                if (Object.keys(useCaseData).length > 0) {
                    const generalInfoRef = useCaseRef.collection('generalInfo').doc(versionId);
                    transaction.set(generalInfoRef, {
                        ...useCaseData,
                        uploadedAt: timestamp
                    }, { merge: true });
                }
            });
            res.json({ success: true, message: 'Use case updated successfully with versioning' });
        }
        catch (error) {
            console.error('Error updating use case:', error);
            res.status(500).json({ success: false, error: 'Failed to update use case' });
        }
    });
});
// Delete use case
exports.deleteUseCase = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
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
            await (0, helpers_1.deleteCollection)(`entities/${entityId}/useCases/${useCaseId}/metrics`, 50);
            await (0, helpers_1.deleteCollection)(`entities/${entityId}/useCases/${useCaseId}/history`, 50);
            await firebase_1.db.collection('entities').doc(entityId).collection('useCases').doc(useCaseId).delete();
            res.json({ success: true, message: 'Use case deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting use case:', error);
            res.status(500).json({ success: false, error: 'Failed to delete use case' });
        }
    });
});
exports.revertUseCaseVersion = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
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
            const useCaseRef = firebase_1.db.collection('entities').doc(entityId).collection('useCases').doc(useCaseId);
            const historyDocRef = useCaseRef.collection('history').doc(versionId);
            const historyDoc = await historyDocRef.get();
            if (!historyDoc.exists) {
                res.status(404).json({ success: false, error: 'History version not found' });
                return;
            }
            const versionData = historyDoc.data();
            // The version data contains a 'versionedAt' field which we don't want in the main doc
            const { versionedAt, ...revertData } = versionData;
            // Update the main document with the historical data
            await useCaseRef.set({
                ...revertData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Set a new update timestamp
                lastRevertedFrom: versionId, // Optional: track the revert operation
            }, { merge: true });
            res.json({ success: true, message: `Use case reverted to version ${versionId}` });
        }
        catch (error) {
            console.error('Error reverting use case version:', error);
            res.status(500).json({ success: false, error: 'Failed to revert use case version' });
        }
    });
});
exports.getUseCaseHistory = functions.https.onRequest((req, res) => {
    (0, cors_1.corsHandler)(req, res, async () => {
        try {
            const { entityId, useCaseId } = req.query;
            if (!entityId || !useCaseId) {
                res.status(400).json({ success: false, error: 'Entity ID and Use Case ID are required' });
                return;
            }
            const historySnapshot = await firebase_1.db
                .collection('entities')
                .doc(entityId)
                .collection('useCases')
                .doc(useCaseId)
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
        }
        catch (error) {
            console.error('Error getting use case history:', error);
            res.status(500).json({ success: false, error: 'Failed to get use case history' });
        }
    });
});
exports.deleteUploadedFile = functions.https.onCall(async (data, context) => {
    const { entityId, useCaseId, fileId } = data;
    if (!entityId || !useCaseId || !fileId) {
        throw new functions.https.HttpsError('invalid-argument', 'Entity ID, Use Case ID, and File ID are required.');
    }
    const useCaseRef = firebase_1.db.collection('entities').doc(entityId).collection('useCases').doc(useCaseId);
    const fileRef = useCaseRef.collection('uploadedFiles').doc(fileId);
    try {
        await firebase_1.db.runTransaction(async (transaction) => {
            const fileDoc = await transaction.get(fileRef);
            if (!fileDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Uploaded file not found.');
            }
            const fileData = fileDoc.data();
            const category = fileData.category;
            if (category) {
                let collectionName = '';
                if (category === 'technical')
                    collectionName = 'technicalMetrics';
                else if (category === 'business')
                    collectionName = 'businessMetrics';
                else if (category === 'financial')
                    collectionName = 'financialMetrics';
                if (collectionName) {
                    const metricsQuery = await useCaseRef.collection(collectionName).where('fileId', '==', fileId).get();
                    metricsQuery.docs.forEach((doc) => {
                        transaction.delete(doc.ref);
                    });
                }
            }
            transaction.delete(fileRef);
        });
        return { success: true, message: 'File deleted successfully.' };
    }
    catch (error) {
        console.error('Error deleting uploaded file:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'An unexpected error occurred while deleting the file.');
    }
});
//# sourceMappingURL=use-case.controller.js.map
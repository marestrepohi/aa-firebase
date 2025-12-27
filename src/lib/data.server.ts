// Data layer - Local JSON API (Server-side)
// Replaces Firebase with local file-based storage
import 'server-only';

// Re-export all functions from the local adapter
export {
  getEntities,
  getEntity,
  addEntity,
  updateEntity,
  deleteEntity,
  getUseCases,
  getUseCase,
  getAllUseCases,
  addUseCase,
  updateUseCase,
  getUseCaseHistory,
  revertUseCaseVersion,
  getMetricsHistory,
  saveMetrics,
  getMetric,
  saveUploadedFile,
  deleteUploadedFile,
  getSummaryMetrics,
} from './data.local';

// Re-export types for convenience
export type { Entity, UseCase, SummaryMetrics, TeamMember } from './types';

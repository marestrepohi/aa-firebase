// API client for Firebase Cloud Functions
const API_BASE = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || '';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Entities
export async function getEntities() {
  try {
    const res = await fetch(`${API_BASE}/getEntities`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching entities:', error);
    return { success: false, error: 'Failed to fetch entities' };
  }
}

export async function getEntity(id: string) {
  try {
    const res = await fetch(`${API_BASE}/getEntity?id=${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching entity:', error);
    return { success: false, error: 'Failed to fetch entity' };
  }
}

export async function updateEntity(data: {
  id: string;
  name?: string;
  description?: string;
  logo?: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/updateEntity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error('Error updating entity:', error);
    return { success: false, error: 'Failed to update entity' };
  }
}

export async function deleteEntity(id: string) {
  try {
    const res = await fetch(`${API_BASE}/deleteEntity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    return await res.json();
  } catch (error) {
    console.error('Error deleting entity:', error);
    return { success: false, error: 'Failed to delete entity' };
  }
}

// Use Cases
export async function getUseCases(entityId: string) {
  try {
    const res = await fetch(
      `${API_BASE}/getUseCases?entityId=${encodeURIComponent(entityId)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return await res.json();
  } catch (error) {
    console.error('Error fetching use cases:', error);
    return { success: false, error: 'Failed to fetch use cases' };
  }
}

export async function getUseCase(entityId: string, useCaseId: string) {
  try {
    const res = await fetch(
      `${API_BASE}/getUseCase?entityId=${encodeURIComponent(entityId)}&useCaseId=${encodeURIComponent(useCaseId)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return await res.json();
  } catch (error) {
    console.error('Error fetching use case:', error);
    return { success: false, error: 'Failed to fetch use case' };
  }
}

export async function updateUseCase(data: {
  entityId: string;
  id: string;
  name?: string;
  description?: string;
  status?: string;
  highLevelStatus?: string;
  tipoProyecto?: string;
  tipoDesarrollo?: string;
  observaciones?: string;
  sharepoint?: string;
  jira?: string;
  actividadesSharepoint?: string;
  actividadesJira?: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/updateUseCase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error('Error updating use case:', error);
    return { success: false, error: 'Failed to update use case' };
  }
}

export async function deleteUseCase(entityId: string, id: string) {
  try {
    const res = await fetch(`${API_BASE}/deleteUseCase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityId, id }),
    });
    return await res.json();
  } catch (error) {
    console.error('Error deleting use case:', error);
    return { success: false, error: 'Failed to delete use case' };
  }
}

// Metrics
export async function saveMetrics(data: {
  entityId: string;
  useCaseId: string;
  period: string;
  metrics: {
    general: Array<{ label: string; value: string }>;
    financial: Array<{ label: string; value: string }>;
    business: Array<{ label: string; value: string }>;
    technical: Array<{ label: string; value: string }>;
  };
}) {
  try {
    const res = await fetch(`${API_BASE}/saveMetrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error('Error saving metrics:', error);
    return { success: false, error: 'Failed to save metrics' };
  }
}

export async function getMetricsPeriods(entityId: string, useCaseId: string) {
  try {
    const res = await fetch(
      `${API_BASE}/getMetricsPeriods?entityId=${encodeURIComponent(
        entityId
      )}&useCaseId=${encodeURIComponent(useCaseId)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return await res.json();
  } catch (error) {
    console.error('Error fetching metrics periods:', error);
    return { success: false, error: 'Failed to fetch metrics periods' };
  }
}

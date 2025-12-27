// Client-side helpers for dashboard config management
// Using local JSON storage via API routes

import type { DashboardConfig } from './dashboard-config';

/**
 * Save dashboard configuration via API
 */
export async function saveDashboardConfig(
    entityId: string,
    useCaseId: string,
    category: string,
    config: DashboardConfig
): Promise<{ success: boolean; message?: string }> {
    try {
        const response = await fetch('/api/dashboard-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'save',
                entityId,
                useCaseId,
                category,
                config,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to save dashboard config');
        }

        return { success: true, message: 'Dashboard config saved successfully' };
    } catch (error: any) {
        console.error('Error saving dashboard config:', error);
        throw new Error(`Failed to save dashboard config: ${error.message}`);
    }
}

/**
 * Get dashboard configuration via API
 */
export async function getDashboardConfig(
    entityId: string,
    useCaseId: string,
    category: string
): Promise<DashboardConfig | null> {
    try {
        const params = new URLSearchParams({ entityId, useCaseId, category });
        const response = await fetch(`/api/dashboard-config?${params.toString()}`);

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data as DashboardConfig;
    } catch (error) {
        console.error('Error getting dashboard config:', error);
        return null;
    }
}

/**
 * Delete dashboard configuration via API
 */
export async function deleteDashboardConfig(
    entityId: string,
    useCaseId: string
): Promise<{ success: boolean }> {
    try {
        const response = await fetch('/api/dashboard-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete',
                entityId,
                useCaseId,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to delete dashboard config');
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting dashboard config:', error);
        throw new Error(`Failed to delete dashboard config: ${error.message}`);
    }
}

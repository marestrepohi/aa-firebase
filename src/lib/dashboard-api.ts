// Client-side helpers for dashboard config management

import type { DashboardConfig } from './dashboard-config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/augusta-edge-project/us-central1';

/**
 * Save dashboard configuration to Firestore
 */
export async function saveDashboardConfig(
    entityId: string,
    useCaseId: string,
    category: string,
    config: DashboardConfig
): Promise<{ success: boolean; message?: string }> {
    try {
        const response = await fetch(`${API_URL}/saveDashboardConfig`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ entityId, useCaseId, category, config }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to save dashboard config: ${response.status} - ${errorText}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error saving dashboard config:', error);
        throw error;
    }
}

/**
 * Get dashboard configuration from Firestore
 */
export async function getDashboardConfig(
    entityId: string,
    useCaseId: string,
    category: string
): Promise<DashboardConfig | null> {
    try {
        const response = await fetch(
            `${API_URL}/getDashboardConfig?entityId=${entityId}&useCaseId=${useCaseId}&category=${category}`
        );

        if (!response.ok) {
            throw new Error('Failed to get dashboard config');
        }

        const data = await response.json();
        return data.config;
    } catch (error) {
        console.error('Error getting dashboard config:', error);
        return null;
    }
}

/**
 * Delete dashboard configuration from Firestore
 */
export async function deleteDashboardConfig(
    entityId: string,
    useCaseId: string
): Promise<{ success: boolean }> {
    try {
        const response = await fetch(`${API_URL}/deleteDashboardConfig`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ entityId, useCaseId }),
        });

        if (!response.ok) {
            throw new Error('Failed to delete dashboard config');
        }

        return response.json();
    } catch (error) {
        console.error('Error deleting dashboard config:', error);
        throw error;
    }
}

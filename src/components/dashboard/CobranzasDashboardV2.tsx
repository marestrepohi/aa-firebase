"use client";

import { useState } from 'react';
import { DynamicDashboard } from '@/components/dashboard/DynamicDashboard';
import { cobranzasTemplate } from '@/components/dashboard/templates';
import type { DashboardConfig } from '@/lib/dashboard-config';

interface CobranzasDashboardV2Props {
    metricsData: any[];
    history: any[];
    descriptions: Record<string, string>;
    selectedHistoryId: string;
    onHistoryChange: (id: string) => void;
}

/**
 * Cobranzas Dashboard V2 - Using the new modular system
 * This demonstrates how to use DynamicDashboard with a template
 */
export function CobranzasDashboardV2(props: CobranzasDashboardV2Props) {
    // In the future, this config will come from Firestore
    // For now, we use the predefined template
    const [dashboardConfig] = useState<DashboardConfig>(cobranzasTemplate);

    return (
        <DynamicDashboard
            config={dashboardConfig}
            metricsData={props.metricsData}
            history={props.history}
            selectedHistoryId={props.selectedHistoryId}
            onHistoryChange={props.onHistoryChange}
        />
    );
}

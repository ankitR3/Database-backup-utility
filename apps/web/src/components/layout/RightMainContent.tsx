'use client'

import { DashboardEnum } from "@/src/constants/DashboardEnum"
import DashboardBase from "../dashboard/DashboardBase"
import BackupBase from "../backups/BackupBase"
import SchedulerBase from "../scheduler/SchedulerBase";
import StatsBase from "../stats/StatsBase";
import SettingsBase from "../settings/SettingsBase";
import { useDashboardStore } from "@/src/store/useDashboardStore";

function renderPanel(activeTab: DashboardEnum) {
    switch (activeTab) {
        case DashboardEnum.DASHBOARD:
            return <DashboardBase />;
        case DashboardEnum.BACKUPS:
            return <BackupBase />;
        case DashboardEnum.SCHEDULER:
            return <SchedulerBase />;
        case DashboardEnum.STATS:
            return <StatsBase />
        case DashboardEnum.SETTINGS:
            return <SettingsBase />;
        default:
            return null;
    }
}

export default function RightMainContent() {
    const { activeTab } = useDashboardStore();
    return (
        <div className="flex-1 h-full">
            {renderPanel(activeTab)}
        </div>
    )
}
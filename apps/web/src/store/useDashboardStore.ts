import { create } from 'zustand';
import { DashboardEnum } from '../constants/DashboardEnum';

interface DashboardStore {
    activeTab: DashboardEnum;
    setActiveTab: (tab: DashboardEnum) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
    activeTab: DashboardEnum.DASHBOARD,
    setActiveTab: (tab) => set({ activeTab: tab }),
}));
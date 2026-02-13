import axios from 'axios';
import { BACKUP_CONFIGS_URL, BACKUP_TOGGLE_URL, BACKUP_DELETE_URL, BACKUP_UPDATE_SCHEDULER_URL } from '@/routes/api-routes';

export async function getBackupConfigs(token: string) {
    const res = await axios.get(BACKUP_CONFIGS_URL, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    return res.data;
}

export async function toggleBackup(token: string, id: string, enabled: boolean) {
    const res = await axios.patch(
        BACKUP_TOGGLE_URL, {
            id,
            enabled
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )

    return res.data;
}

export async function deleteBackup(token: string, id: string) {
    const res = await axios.delete(`${BACKUP_DELETE_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    return res.data;
}

export async function updateScheduler(token: string, data: {id: string, frequency: string, time?: string, dayOfWeek?: number}) {
    const res = await axios.patch(
        BACKUP_UPDATE_SCHEDULER_URL,
        data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return res.data;
}
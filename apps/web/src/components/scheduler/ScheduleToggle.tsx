'use client'

import { useSession } from 'next-auth/react';
import { toggleBackup } from '@/src/services/scheduler.service';
import { Switch } from '../ui/switch';

type Props = {
    id: string
    enabled: boolean
    onToggle: (newValue: boolean) => void
}

export default function ScheduleToggle({ id, enabled, onToggle}: Props) {
    const { data: session } = useSession();
    const token = session?.user?.token as string

    async function handleClick(newValue: boolean) {
        if (!token) return;

        onToggle(newValue);

        try {
            await toggleBackup(token, id, newValue)
        } catch (err) {
            console.error('Schedule toggle Error: ', err);
            onToggle(!newValue)
            alert('Failed to update scheduler')
        }
    }

    return (
        <Switch
            checked={enabled}
            onCheckedChange={handleClick}
        />
    )
}
'use client'

import { useSession } from 'next-auth/react';
import { toggleBackup } from '@/src/services/scheduler.service';

type Props = {
    id: string
    enabled: boolean
    onToggle: (newValue: boolean) => void
}

export default function ScheduleToggle({ id, enabled, onToggle}: Props) {
    const { data: session } = useSession();
    const token = session?.user?.token as string

    async function handleClick() {
        if (!token) {
            return;
        }

        const newValue = !enabled

        onToggle(newValue)

        try {
            await toggleBackup(token, id, newValue)
        } catch (err) {
            console.error('Schedule toggle Error: ', err);
            onToggle(enabled)
            alert('Failed to update scheduler')
        }
    }

    return (
        <button
            onClick={handleClick}
            className={`px-3 text-md rounded-md hover:bg-green-700 hover:cursor-pointer transition ${
                enabled ? 'bg-green-600 hover:bg-green-600' : 'bg-gray-600 hover:bg-gray-600'
            }`}
        >
            {enabled ? 'Disable' : 'Enable'}
        </button>
    )
}
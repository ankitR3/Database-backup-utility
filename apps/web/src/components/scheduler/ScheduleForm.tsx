'use client'

import { useEffect, useState } from 'react';
import { updateScheduler } from '@/src/services/scheduler.service';
import { useSession } from 'next-auth/react';

type Props = {
    configId: string
    initialFrequency?: string
    initialTime?: string
    initialDayofWeek?: number
    onUpdated?: () => void
}

export default function SchedulerForm({ configId, initialFrequency, initialTime, initialDayofWeek, onUpdated }: Props) {
    const { data: session } = useSession();
    const token = session?.user?.token as string;

    const [frequency, setFrequency] = useState('daily')
    const [time, setTime] = useState('12:00')
    const [dayOfWeek, setDayOfWeek] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialFrequency) setFrequency(initialFrequency)
        if (initialTime) setTime(initialTime)
        if (initialDayofWeek !== undefined) setDayOfWeek(initialDayofWeek)
    }, [initialFrequency, initialTime, initialDayofWeek]);

    async function handleSave() {
        if (!token) {
            return;
        }

        try {
            setLoading(true);

            const payload: any = {
                id: configId,
                frequency,
            };

            if (frequency === 'daily') {
                payload.time = time;
            }

            if (frequency === 'weekly') {
                payload.time = time;
                payload.dayOfWeek = dayOfWeek;
            }

            await updateScheduler(token, payload);

            onUpdated?.();
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='bg-white shadow-sm p-4 rounded-xl space-y-1 space-x-3 mt-4'>
            <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className='bg-gray-200 text-black p-1.5 text-md rounded hover:cursor-pointer'
            >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
            </select>

            {(frequency === 'daily' || frequency === 'weekly') && (
                <input
                    type='time'
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className='bg-gray-200 text-black p-1 rounded hover:cursor-pointer'
                />
            )}

            {frequency === 'weekly' && (
                <select
                    value={dayOfWeek ?? 1}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className='bg-gray-200 text-black p-1.5 rounded hover:cursor-pointer'
                >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                </select>
            )}

            <button
                onClick={handleSave}
                disabled={loading}
                className='bg-green-600 text-white mt-2 px-3 py-1 rounded hover:bg-green-600/80 hover:cursor-pointer'
            >
                {loading ? 'Saving...' : 'Save Schedule'}
            </button>
        </div>
    )
}
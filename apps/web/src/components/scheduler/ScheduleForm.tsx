'use client'

import { useState } from 'react';
import { updateScheduler } from '@/src/services/scheduler.service';
import { useSession } from 'next-auth/react';

type Props = {
    configId: string
    onUpdated?: () => void
}

export default function SchedulerForm({ configId, onUpdated }: Props) {
    const { data: session } = useSession();
    const token = session?.user?.token as string;

    const [frequency, setFrequency] = useState('daily')
    const [time, setTime] = useState('12:00')
    const [dayOfWeek, setDayOfWeek] = useState(1);
    const [loading, setLoading] = useState(false);

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
        <div className='bg-[#1D1D29] p-4 rounded-xl space-y-4 mt-4'>
            <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className='bg-[#25253A] p-2 rounded'
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
                    className='bg-[#25253A] p-2 rounded'
                />
            )}

            {frequency === 'weekly' && (
                <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className='bg-[#25253A] p-2 rounded'
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
                className='bg-green-600 px-4 py-2 rounded'
            >
                {loading ? 'Saving...' : 'Save Schedule'}
            </button>
        </div>
    )
}
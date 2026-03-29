'use client'

import { useSession } from 'next-auth/react';
import { toggleBackup } from '@/src/services/scheduler.service';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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
        <TooltipProvider delay={0}>
            <Tooltip>
                <TooltipTrigger>
                    <Switch
                        checked={enabled}
                        onCheckedChange={handleClick}
                        className='hover:cursor-pointer'
                    />
                </TooltipTrigger>
                <TooltipContent side='top'>
                    {enabled ? 'enable' : 'disable'}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
'use client'

import axios from 'axios';
import { useSession } from 'next-auth/react';
import { BACKUP_DELETE_URL } from '@/routes/api-routes';

type Props = {
    backupId: string
    onDelete?: () => void
}

export default function DeleteBackupButton({ backupId, onDelete }: Props) {
    const { data: session } = useSession();
    const token = session?.user?.token as string

    async function handleDelete() {

        if (!token) {
            return;
        }

        const confirmed = confirm('Delete this backup?')
        if (!confirmed) {
            return;
        }

        try {

            await axios.delete(`{BACKUP_DELETE_URL}/${backupId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            onDelete?.()
        } catch (err) {
            console.error('Delete backup failed', err);
        }
    }

    return (
        <button
            onClick={handleDelete}
            className='text-red-400 hover:text-red-300 text-sm hover:cursor-pointer'
        >
            Delete
        </button>
    )
}
'use client'

import axios from 'axios';
import { useState } from 'react';

export default function BackupButton() {
    const [loading, setLoading] = useState(false);

    async function runBackup() {
        try {
            setLoading(true)

            await axios.post('http://localhost:1516/api/v1//backup/create')

            alert('Backup completed!')
        } catch (err) {
            console.error(err);
            alert('Backup failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={runBackup}
            disabled={loading}
            className='bg-green-600 text-white px-5 py-2 rounded'
        >
            {loading ? 'Running...' : 'Run Backup Now'}
        </button>
    )
}
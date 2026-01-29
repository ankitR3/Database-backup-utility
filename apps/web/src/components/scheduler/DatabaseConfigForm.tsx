'use client'

import { useState } from 'react';
import axios from 'axios';

export default function BackupConfigForm({ type }: {
    type: 'mongo' | 'postgres'
}) {
    const [dbName, setDbName] = useState('');
    const [uri, setUri] = useState('');
    const [loading, setLoading] = useState(false);

    async function saveConfig() {
        try {
            setLoading(true);

            await axios.post('http://localhost:1516/api/v1/backup/schedule', {
                type,
                uri,
                dbName
            })

            alert('Backup config saved!')

        } catch(err) {
            console.error('Database-Config-Form: ', err);
            alert('Finally to save config')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='bg-[#1D1D29] rounded-2xl p-6 shadow-lg max-w-xl'>
            <h2 className='text-xl font-semibold text-white mb-4'>
                {type === "mongo" ? "MongoDB Backup Config" : "Postgres Backup Config"}
            </h2>
            <div className='space-y-4'>
                <input
                    placeholder='Database URI'
                    value={uri}
                    onChange={(e) => setUri(e.target.value)}
                    className='w-full bg-[#25253A] px-4 py-3 rounded-lg text-white outline-none'
                />
                <br />
                <br />

                <input
                    placeholder="Database Name"
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                    className="w-full bg-[#25253A] px-4 py-3 rounded-lg text-white outline-none"
                />
                <br />
                <br />

                <button
                    onClick={saveConfig}
                    disabled={loading}
                    className='bg-blue-600 hover:bg-blue-700 transition px-5 py-2 rounded-lg text-white'
                >
                    {loading ? 'Saving...' : 'Save Backup Config'}
                </button>
            </div>
        </div>
    )
}
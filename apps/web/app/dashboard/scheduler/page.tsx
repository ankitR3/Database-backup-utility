'use client'

import ConfigCard from '@/src/components/scheduler/ConfigCard';
import BackupConfigForm from '@/src/components/scheduler/DatabaseConfigForm';
import { useState } from 'react';

export default function() {
  const [selectedType, setSelectedType] = useState<'mongo' | 'postgres' | null>(null);

  function selectHandler(type: 'mongo' | 'postgres') {
    setSelectedType(prev => (prev === type ? null : type))
  }
  return (
    <div className='space-y-10'>
        <div className='grid grid-cols md:grid-cols-2 gap-7 max-w-xl'>

          <ConfigCard
            title='MongoDB backups'
            description='Configure for Mongo Backup'
            active={selectedType === 'mongo'}
            onClick={() => selectHandler('mongo')}
          />

          <ConfigCard
            title="Postgres Backups"
            description="Configure for Postgres Backup"
            active={selectedType === 'postgres'}
            onClick={() => selectHandler("postgres")}
          />

        </div>
        {selectedType && (
          <BackupConfigForm type={selectedType} />
        )}
    </div>
  )
}
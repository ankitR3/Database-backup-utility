'use client'

import ConfigCard from '@/src/components/scheduler/ConfigCard';
import BackupConfigForm from '@/src/components/scheduler/DatabaseConfigForm';
import { useState } from 'react';

export default function() {
  const [selectedType, setSelectedType] = useState<'mongo' | 'postgres' | null>(null);
  return (
    <div className='space-y-10'>
      {/* Cards section */}
        <div className='grid grid-cols md:grid-cols-2 gap-6'>
          <ConfigCard
            title='MongoDB backups'
            description='Configure scheduled Mongo backups'
            onClick={() => setSelectedType('mongo')}
          />

          <ConfigCard
            title="Postgres Backups"
            description="Configure scheduled Postgres backups"
            onClick={() => setSelectedType("postgres")}
          />
        </div>
        {selectedType && (
          <BackupConfigForm type={selectedType} />
        )}
    </div>
  )
}
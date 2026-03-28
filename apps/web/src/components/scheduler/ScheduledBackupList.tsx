'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { getBackupConfigs, deleteBackup } from '@/src/services/scheduler.service'
import SchedulerSkeleton from './SchedulerSkeleton'
import SchedulerForm from './ScheduleForm'
import ScheduleToggle from './ScheduleToggle'
import SchedulerRunButton from './ScheduleRunButton'
import Modal from '../ui/Modal'
import ConfirmModal from '../ui/ConfirmModal'
import { IconDatabase } from '@tabler/icons-react';
import { Button } from '../ui/button';

type BackupConfig = {
  id: string
  type: 'mongo' | 'postgres'
  enabled: boolean
  isRunning: boolean
  lastRunAt?: string
  frequency?: string
  time?: string
  dayOfWeek?: number
  mongoDbName?: string
  pgDbName?: string
}

type Props = {
  onAddClick: () => void
}

function getSchedulerText(config: BackupConfig) {
  if (config.frequency === 'hourly') {
    return 'Every hour';
  }
  
  if (config.frequency === 'daily' && config.time) {
    return `Daily at ${config.time}`;
  }
  
  if (config.frequency === 'weekly' && config.time) {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
    
    return `Weekly on ${days[config.dayOfWeek ?? 0]} at ${config.time}`;
  }
  
  return config.frequency ?? 'Not scheduled';
}

export default function ScheduledBackupList({ onAddClick }: Props) {
  const { data: session, status } = useSession()
  const token = session?.user?.token as string
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const [configs, setConfigs] = useState<BackupConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function loadConfigs(showLoader = false) {
    if (!token) {
      return;
    }

    if (showLoader) {
      setLoading(true);
    }

    try {
      const data = await getBackupConfigs(token)
      setConfigs(prev => {
        if (JSON.stringify(prev) === JSON.stringify(data)) {
          return prev;
        }
        return data;
      });
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (!token) return;
    loadConfigs(true)
  }, [token])

  useEffect(() => {
    if (!token) return;
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      loadConfigs(false)
    }, 10000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [token]);

  async function handleDelete(id: string) {
    if (!token) return;

    setConfigs(prev => prev.filter(c => c.id !== id))
    await deleteBackup(token, id)
  }

  if (status === 'loading') return null;

  if (status !== 'authenticated') {
    return (
      <p className="text-gray-400">
        Please login to view schedules
      </p>
    )
  }

  return (
    <div className="space-y-2 w-105 mt-10">
      <h2 className="text-2xl font-bold text-black p-2">
        Your Scheduled Backup
      </h2>

      {loading ? (
        <SchedulerSkeleton />
      ) : configs.length === 0 ? (
        <div>
          <div className='text-black p-4 rounded-full'>
            <IconDatabase size={32} className='text=gray-300' />
          </div>
          <p className='text-gray-900 font-semibold text-lg'>No Backups Yet</p>
          <p className='text-black'>
            You haven't created any backup yet. Get started by creating your first backup.
          </p>
          <Button
            onClick={onAddClick}
          >
            Create Backup
          </Button>
        </div>
      ) : (
        configs.map(config => (
          <div
            key={config.id}
            className="bg-[#ffffff] outline-solid-10 shadow-[0_0_3px_rgba(0,0,0,0.25)] p-5 rounded-lg space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className='space-y-2'>
                <p className="text-lg text-black font-bold capitalize">
                  -{config.type}- {config.mongoDbName || config.pgDbName}
                </p>
                <p className="text-sm text-gray-400 font-semibold">
                  {config.isRunning ? (
                    <span className='text-yellow-600 animate-pulse'>
                      Running...
                    </span>
                  ) : config.enabled ? (
                    <span className='text-green-600'>
                      Scheduled
                    </span>
                  ) : (
                    <span className='text-red-600'>
                      Disabled
                    </span>
                  )}
                </p>

                {config.frequency && (
                  <p className="text-sm text-black font-semibold">
                    {getSchedulerText(config)}
                  </p>
                )}

                {config.lastRunAt && (
                  <p className='text-xs text-gray-500 font-bold'>
                    Last run: {new Date(config.lastRunAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <ScheduleToggle
                  id={config.id}
                  enabled={config.enabled}
                  onToggle={async () => await loadConfigs()}
                />

                <SchedulerRunButton
                  configId={config.id}
                  enabled={config.enabled}
                />

                <Button
                  variant='destructive'
                  onClick={() => setDeleteId(config.id)}
                >
                  Delete
                </Button>
              </div>
            </div>

            <SchedulerForm
              configId={config.id}
              initialFrequency={config.frequency}
              initialTime={config.time}
              initialDayofWeek={config.dayOfWeek}
              onUpdated={loadConfigs}
            />
          </div>
        ))
      )}

      {deleteId && (
        <Modal>
          <ConfirmModal
            title='Delete backups?'
            description='This action cannot be undone.'
            confirmLabel='Delete'
            onConfirm={() => { handleDelete(deleteId); setDeleteId(null); }}
            onCancel={() => setDeleteId(null)}
          />
        </Modal>
      )}
    </div>
  )
}
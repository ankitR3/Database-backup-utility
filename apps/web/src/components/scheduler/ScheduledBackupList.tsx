'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getBackupConfigs, deleteBackup } from '@/src/services/scheduler.service'
import SchedulerSkeleton from './SchedulerSkeleton'
import SchedulerForm from './ScheduleForm'
import ScheduleToggle from './ScheduleToggle'
import SchedulerRunButton from './ScheduleRunButton'

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

export default function ScheduledBackupList() {
  const { data: session, status } = useSession()
  const token = session?.user?.token as string

  const [configs, setConfigs] = useState<BackupConfig[]>([])
  const [loading, setLoading] = useState(true)

  async function loadConfigs() {
    if (!token) {
      return;
    }
    const data = await getBackupConfigs(token)
    setConfigs(data)
  }

  useEffect(() => {
    if (status !== 'authenticated' || !token) {
      setConfigs([])
      setLoading(false)
      return
    }

    async function init() {
      try {
        setLoading(true)
        await loadConfigs()
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [status, token])

  useEffect(() => {
    if (status !== 'authenticated' || !token) {
      return;
    }

    const interval = setInterval(() => {
      loadConfigs()
    }, 5000)

    return () => clearInterval(interval)
  }, [status, token]);

  // useEffect(() => {
  //   console.log("JWT:", session?.user?.token);
  // }, [session]);

  async function handleDelete(id: string) {
    if (!token) return

    setConfigs(prev => prev.filter(c => c.id !== id))
    await deleteBackup(token, id)
  }

  if (status === 'loading') return null

  if (status !== 'authenticated') {
    return (
      <p className="text-gray-400">
        Please login to view schedules
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Your Scheduled Backup
      </h2>

      {loading ? (
        <SchedulerSkeleton />
      ) : configs.length === 0 ? (
        <p className="text-gray-400">No configs yet.</p>
      ) : (
        configs.map(config => (
          <div
            key={config.id}
            className="bg-[#1D1D29] p-5 rounded-xl space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className='space-y-2'>
                
                <p className="text-lg font-semibold capitalize">
                  {config.type} - {config.mongoDbName || config.pgDbName}
                </p>

                <p className="text-sm text-gray-400">
                  {config.isRunning ? (
                    <span className='text-yellow-400 animate-pulse'>
                      Running...
                    </span>
                  ) : config.enabled ? (
                    <span className='text-green-400'>
                      Scheduled
                    </span>
                  ) : (
                    <span className='text-red-400'>
                      Disabled
                    </span>
                  )}
                </p>

                {config.frequency && (
                  <p className="text-sm text-gray-300">
                    {config.frequency}
                    {config.time && ` at ${config.time}`}
                  </p>
                )}

                {config.lastRunAt && (
                  <p className='text-xs text-gray-500'>
                    Last run: {new Date(config.lastRunAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <ScheduleToggle
                  id={config.id}
                  enabled={config.enabled}
                  onToggle={async () => {
                    await loadConfigs()
                  }}
                />

                <SchedulerRunButton
                  configId={config.id}
                  enabled={config.enabled}
                />

                <button
                  onClick={() => handleDelete(config.id)}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 hover:cursor-pointer transition"
                >
                  Delete
                </button>
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
    </div>
  )
}
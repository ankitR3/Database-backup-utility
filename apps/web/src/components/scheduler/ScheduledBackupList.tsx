'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getBackupConfigs, toggleBackup, deleteBackup } from '@/src/services/scheduler.service'
import SchedulerSkeleton from './SchedulerSkeleton'
import SchedulerForm from './ScheduleForm'

type BackupConfig = {
  id: string
  type: 'mongo' | 'postgres'
  enabled: boolean
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

  useEffect(() => {
    if (status !== 'authenticated') {
      setConfigs([])
      setLoading(false)
      return
    }

    async function load() {
      try {
        setLoading(true)
        const data = await getBackupConfigs(token)
        setConfigs(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [status, token])

  async function handleToggle(id: string, enabled: boolean) {
    if (!token) return

    setConfigs(prev =>
      prev.map(c => (c.id === id ? { ...c, enabled } : c))
    )

    await toggleBackup(token, id, enabled)
  }

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
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold capitalize">
                  {config.type} - {config.mongoDbName || config.pgDbName}
                </p>

                <p className="text-sm text-gray-400">
                  {config.enabled ? 'Enabled' : 'Disabled'}
                </p>

                {config.frequency && (
                  <p className="text-sm text-gray-300">
                    {config.frequency}
                    {config.time && ` at ${config.time}`}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    handleToggle(config.id, !config.enabled)
                  }
                  className="bg-blue-600 px-4 py-2 rounded"
                >
                  {config.enabled ? 'Disable' : 'Enable'}
                </button>

                <button
                  onClick={() => handleDelete(config.id)}
                  className="bg-red-600 px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>

            <SchedulerForm configId={config.id} />
          </div>
        ))
      )}
    </div>
  )
}
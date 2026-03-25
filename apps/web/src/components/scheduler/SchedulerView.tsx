'use client'

import { useState } from 'react';
import BackupConfigForm from './BackupConfigForm';
import ScheduledBackupList from './ScheduledBackupList';
import Modal from '../ui/Modal';

export default function SchedulerView() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-5">
      <button
        onClick={() => setOpen(prev => !prev)}
        className='relative z-10 bg-[#111111] text-white hover:bg-stone-800/90 font-bold transition px-4 py-2 rounded-md hover:cursor-pointer'
      >
        Add Backup Config
      </button>

      {open && (
        <Modal>
          <BackupConfigForm
            onSaved={() => setOpen(false)}
            onClose={() => setOpen(false)}
          />
        </Modal>
      )}

      <ScheduledBackupList />
    </div>
  )
}
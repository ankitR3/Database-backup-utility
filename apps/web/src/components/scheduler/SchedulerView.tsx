'use client'

import { useState } from 'react';
import BackupConfigForm from './BackupConfigForm';
import ScheduledBackupList from './ScheduledBackupList';
import Modal from '../ui/Modal';

export default function SchedulerView() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-5">
      {open && (
        <Modal>
            <BackupConfigForm
                onSaved={() => setOpen(false)}
                onClose={() => setOpen(false)}
            />
        </Modal>
      )}
      <ScheduledBackupList onAddClick={() => setOpen(true)} />
    </div>
  )
}
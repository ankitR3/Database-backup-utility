'use client'

import { useState } from 'react';
import BackupConfigForm from './BackupConfigForm';
import ScheduledBackupList from './ScheduledBackupList';
import { Dialog, DialogContent } from '../ui/dialog';

export default function SchedulerView() {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-5">
      <Dialog open={open}>
        <DialogContent
          showCloseButton={false}
          className='sm:max-w-md'
        >
          <BackupConfigForm
            onSaved={() => {
              setOpen(false);
              setRefreshKey(prev => prev + 1);
            }}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ScheduledBackupList
        onAddClick={() => setOpen(true)}
        refreshKey={refreshKey}
      />
    </div>
  )
}
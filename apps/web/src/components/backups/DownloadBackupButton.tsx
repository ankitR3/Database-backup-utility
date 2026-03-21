'use client'

import { BACKUP_DOWNLOAD_URL } from '@/routes/api-routes';

type Props = {
    backupId: string
}

export default  function DownlaodBackupButton({ backupId}: Props) {

    function handleDownload() {
        const url = `${BACKUP_DOWNLOAD_URL}?backupId=${backupId}`
        window.open(url, '_blank')
    }

    return (
        <button
            onClick={handleDownload}
            className='text-blue-400 hover:text-blue-300 text-sm hover:cursor-pointer'
        >
            Downlaod
        </button>
    )
}
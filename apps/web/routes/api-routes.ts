const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const API_URL = BACKEND_URL + '/api/v1';
export const LOGIN_URL = API_URL + '/login';

export const BACKUP_SCHEDULE_URL = API_URL + '/backup/schedule';
export const BACKUP_CREATE_URL = API_URL + '/backup/create';
export const BACKUP_DOWNLOAD_URL = API_URL + '/backup/download';

export const HEALTH_URL = API_URL + '/health';
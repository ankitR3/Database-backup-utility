const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const API_URL = BACKEND_URL + '/api/v1';

export const LOGIN_URL = API_URL + '/login';

export const BACKUP_SCHEDULE_URL = API_URL + '/backup/schedule';
export const BACKUP_CREATE_URL = API_URL + '/backup/create';
export const BACKUP_DOWNLOAD_URL = API_URL + '/backup/download';

export const BACKUP_CONFIGS_URL = API_URL + '/backup/configS';
export const BACKUP_TOGGLE_URL = API_URL + '/backup/toggle';
export const BACKUP_UPDATE_SCHEDULER_URL = API_URL + '/backup/scheduler-update';
export const BACKUP_DELETE_URL = API_URL + '/backup/config';

export const HEALTH_URL = API_URL + '/health';
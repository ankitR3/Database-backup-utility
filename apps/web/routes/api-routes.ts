const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const API_URL = BACKEND_URL + '/api/v1';

export const LOGIN_URL = API_URL + '/login';

export const BACKUP_SCHEDULE_URL = API_URL + '/backup/schedule';
export const BACKUP_CREATE_URL = API_URL + '/backup/create';
export const BACKUP_DOWNLOAD_URL = API_URL + '/backup/download';

export const BACKUP_CONFIGS_URL = API_URL + '/backup/configs';
export const BACKUP_TOGGLE_URL = API_URL + '/backup/config';
export const BACKUP_UPDATE_SCHEDULER_URL = API_URL + '/backup/update-scheduler';

export const BACKUP_CONFIG_DELETE_URL = API_URL + '/backup/config';
export const BACKUP_DELETE_URL = API_URL + '/backup';

export const BACKUP_HISTORY_URL = API_URL + '/backup/history';
export const BACKUP_STATUS_URL = API_URL + '/backup/stats';

export const HEALTH_URL = API_URL + '/health';
export function generateCron(
    frequency?: string,
    time?: string,
    dayOfWeek?: number
): string | null {
    if (!frequency) {
        return null
    }

    if (frequency === 'hourly') {
        return '0 * * * *';
    }

    if (frequency === 'daily' && time) {
        const [hour, minute] = time.split(':');
        return `${minute} ${hour} * * *`;
    }

    if (frequency === 'weekly' && time && dayOfWeek !== undefined) {
        const [hour, minute] = time.split(':');
        return `${minute} ${hour} * * ${dayOfWeek}`;
    }

    return null;
}
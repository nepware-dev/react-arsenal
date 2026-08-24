export const parseTimeToMinutes = (time: string): number | null => {
    const trimmed = time.trim();

    const twentyFourHourMatch = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
    if (twentyFourHourMatch) {
        const hours = Number(twentyFourHourMatch[1]);
        const minutes = Number(twentyFourHourMatch[2]);
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return null;
        }
        return hours * 60 + minutes;
    }

    const twelveHourMatch = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(trimmed);
    if (twelveHourMatch) {
        const hours = Number(twelveHourMatch[1]);
        const minutes = Number(twelveHourMatch[2]);
        if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
            return null;
        }
        const isPm = twelveHourMatch[3].toUpperCase() === 'PM';
        const hours24 = isPm ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours);
        return hours24 * 60 + minutes;
    }

    return null;
};

export const to12HourLabel = (time: string): string => {
    const [hourStr, minuteStr] = time.split(':');
    const hour = parseInt(hourStr, 10);
    const ampm = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minuteStr} ${ampm}`;
};

export const minutesToTime = (totalMinutes: number): string => {
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minutes = String(totalMinutes % 60).padStart(2, '0');
    return `${hours}:${minutes}`;
};

export const normalizeTime = (time: string): string => {
    const totalMinutes = parseTimeToMinutes(time);
    return totalMinutes === null ? '' : minutesToTime(totalMinutes);
};

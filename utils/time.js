class TimeUtils {
    formatTwoDigits(n) {
        return n < 10 ? '0' + n : n;
    }

    formatTime(seconds) {
        const ss = Math.floor(seconds) % 60;
        const mm = Math.floor(seconds / 60) % 60;
        const hh = Math.floor(seconds / 3600);

        if (hh > 0) {
            return (
                hh + ':' + this.formatTwoDigits(mm) + ':' + this.formatTwoDigits(ss)
            );
        } else {
            return mm + ':' + this.formatTwoDigits(ss);
        }
    }

    get12HourTimeString(date, locale='en', options={}) {
        const dateObj = new Date(date);
        return new Intl.DateTimeFormat(locale, {
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: true,
            ...options
        }).format(dateObj);
    }

    timeSince(time, locale='en', options={}) {
        switch (typeof time) {
            case 'number':
                break;
            case 'string':
                time = +new Date(time);
                break;
            case 'object':
                if(time.constructor === Date) {
                    time = time.getTime();
                }
                break;
            default:
                time = +new Date();
        }

        const timeFormats = [
            [60, 'second', 1],
            [3600, 'minute', 60],
            [86400, 'hour', 3600],
            [604800, 'day', 86400],
            [2419200, 'week', 604800],
            [29030400, 'month', 2419200],
            [Infinity, 'year', 29030400],
        ];

        let seconds = (time - +new Date()) / 1000;
        const rtf = new Intl.RelativeTimeFormat(locale, {numeric: 'auto', ...options});
        let i = 0, format;
        while((format = timeFormats[i++])) {
            if(Math.abs(seconds) < format[0]) {
                const timeSpan = Math[seconds < 0 ? 'ceil' : 'floor'](seconds / format[2]);
                return rtf.format(timeSpan, format[1]);
            }
        };
        return time;
    }
};

export default new TimeUtils();

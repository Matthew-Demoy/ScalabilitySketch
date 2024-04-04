export enum TimeScale {
    MICROSECOND = 1,
    MILLISECOND = 1000,
    SECOND = 1000000
}

export function displayTime(time: number) {
    const microsecondsPerMillisecond = 1000;
    const millisecondsPerSecond = 1000;
    const secondsPerMinute = 60;
    const minutesPerHour = 60;
    const hoursPerDay = 24;
    const daysPerYear = 365;

    const microseconds = time % microsecondsPerMillisecond;
    time = Math.floor(time / microsecondsPerMillisecond);

    const milliseconds = time % millisecondsPerSecond;
    time = Math.floor(time / millisecondsPerSecond);

    const seconds = time % secondsPerMinute;
    time = Math.floor(time / secondsPerMinute);

    const minutes = time % minutesPerHour;
    time = Math.floor(time / minutesPerHour);

    const hours = time % hoursPerDay;
    time = Math.floor(time / hoursPerDay);

    const days = time % daysPerYear;
    const years = Math.floor(time / daysPerYear);

    
    let result = '';
    if (years > 0) {
        result += `Year : ${years} : `;
    }
    if (days > 0) {
        result += `Day : ${days} : `;
    }
    if (hours > 0) {
        result += `Hour : ${hours} : `;
    }
    result += `Minute : ${minutes} : Second : ${seconds} : MS : ${milliseconds} : μs : ${microseconds}`;

    return result;
}


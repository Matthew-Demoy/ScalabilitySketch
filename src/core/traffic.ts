type UserDistribution = { [hour: number]: number };

function distributeUsers(dau: number): UserDistribution {
    let userDistribution: UserDistribution = {};

    for (let hour = 0; hour < 24; hour++) {
        let time = (hour - 16) * Math.PI / 12;
        let percentage = (Math.sin(time) + 1) / 2;
        userDistribution[hour] = Math.round(dau * percentage);
    }

    return userDistribution;
}

function transactionsPerSecond(t: number, dau: number): number {
    let userDistribution = distributeUsers(dau);
    let usersThisHour = userDistribution[t];
    return usersThisHour / 3600;
}

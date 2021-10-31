export function range(i) {
    return [...Array(i).keys()];
}

export function trueRange(max, min = 0) {
    const difference = Math.abs(min - max);

    return [...Array(difference + 1).keys()].map(v => v + min);
}
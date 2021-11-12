export function range(i) {
    if (0 >= i) return [];

    return [...Array(Math.round(i)).keys()];
}

export function trueRange(max, min = 0) {
    const difference = Math.abs(min - max);

    return [...Array(difference + 1).keys()].map(v => v + min);
}

//Weights to be low
export function weightedRandom(min, max) {
    return Math.round(max / (Math.random() * max + min));
}

export const random = (max, min = 0) => {
    return min + Math.round(Math.random() * (max - min));
}

export const randomBooleanByPercentage = (percentage0To1) => {
    return Math.random() >= percentage0To1;
}

export const randomKey = function (obj) {
    const keys = Object.keys(obj);
    return keys[keys.length * Math.random() << 0];
};

export const beatsPercentage = percentage => {
    return Math.random() >= percentage;
}
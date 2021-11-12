import {randomKey, range} from "./Util";
import {random} from "lodash";

const MAX_POINTS_TO_SPEND = 10;
export const POINT_CATEGORIES = {
    visionRange: {
        name: 'visionRange',
        default: 3,
        perPointBonus: 1,
        max: MAX_POINTS_TO_SPEND + 3
    },
    reduceHungerBuildRate: {
        name: 'reduceHungerBuildRate',
        default: 0,
        perPointBonus: -1,
        max: 50
    },
    shitRate: {
        name: 'shitRate',
        default: 1,
        perPointBonus: 0.4,
        max: 4
    }
};

function diminishValue(n, maxIn, maxOut, exponent) {
    // unscale input
    n -= maxIn
    n /= 0 - maxIn

    n = Math.pow(n, exponent)

    // scale output
    n *= 0 - maxOut
    n += maxOut
    return n
}

// hardcoded to even previousItemAverage
const DECAY_COEFFICIENT = 0.52;
export default class Mutator {
    POINT_CATEGORY_KEYS = Object.keys(POINT_CATEGORIES)

    generateRandomPointSpread() {
        let mutators = this.generateDefaultMutators();

        const pointsToSpend = Math.floor(random(0, MAX_POINTS_TO_SPEND));
        mutators.pointDistribution.total = pointsToSpend;

        range(pointsToSpend).forEach(i => {
            let randomPointCategoryKey = randomKey(POINT_CATEGORIES);
            let randomPointCategory = POINT_CATEGORIES[randomPointCategoryKey];
            mutators.pointDistribution[randomPointCategory.name]++;
            this.decayOtherValues(mutators, randomPointCategoryKey);
        });

        Object.keys(POINT_CATEGORIES).forEach(key => {
            let pointValue = mutators.pointDistribution[key];
            mutators[key] += diminishValue(pointValue, MAX_POINTS_TO_SPEND, POINT_CATEGORIES[key].max, 1.5);
        });

        console.log('Mutators', mutators);

        this.POINT_CATEGORY_KEYS.forEach(key => mutators[key] = Math.round(mutators[key]));

        return mutators;
    }

    generateDefaultMutators = () => {
        return {
            visionRange: POINT_CATEGORIES.visionRange.default,
            reduceHungerBuildRate: POINT_CATEGORIES.reduceHungerBuildRate.default,
            shitRate: POINT_CATEGORIES.shitRate.default,
            pointDistribution: {
                total: 0,
                visionRange: 0,
                reduceHungerBuildRate: 0,
                shitRate: 0
            }
        }
    }

    decayOtherValues = (mutators, chosenKey) => {
        for (const i in this.POINT_CATEGORY_KEYS) {
            const key = this.POINT_CATEGORY_KEYS[i];
            if (key !== chosenKey && key.name !== "") {
                mutators[key] -= POINT_CATEGORIES[key].perPointBonus / (this.POINT_CATEGORY_KEYS.length * DECAY_COEFFICIENT);
            }
        }
    }
}
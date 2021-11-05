import {randomKey, range} from "./Util";
import {random} from "lodash";

const POINT_CATEGORIES = {
    visionRange: {
        name: 'visionRange',
        default: 3,
        perPointBonus: 1
    },
    hungerBuildRate: {
        name: 'hungerBuildRate',
        default: 100,
        perPointBonus: -20
    },
    shitRate: {
        name: 'shitRate',
        default: 1,
        perPointBonus: 0.2
    }
};

const POINT_CATEGORY_KEYS = Object.keys(POINT_CATEGORIES);
export default class Mutator {
    generateRandomPointSpread() {
        let mutators = this.generateDefaultMutators();

        const pointsToSpend = Math.floor(random(0, 10));
        mutators.pointDistribution.total = pointsToSpend;

        range(pointsToSpend).forEach(i => {
            let randomPointCategoryKey = randomKey(POINT_CATEGORIES);
            let randomPointCategory = POINT_CATEGORIES[randomPointCategoryKey];
            mutators[randomPointCategory.name] += randomPointCategory.perPointBonus;
            mutators.pointDistribution[randomPointCategory.name]++;
            this.decayOtherValues(mutators, randomPointCategoryKey);
        });

        console.log('Mutators', mutators);

        POINT_CATEGORY_KEYS.forEach(key => mutators[key] = Math.round(mutators[key]));

        return mutators;
    }

    generateDefaultMutators = () => {
        return {
            visionRange: POINT_CATEGORIES.visionRange.default,
            hungerBuildRate: POINT_CATEGORIES.hungerBuildRate.default,
            shitRate: POINT_CATEGORIES.shitRate.default,
            pointDistribution: {
                total: 0,
                visionRange: 0,
                hungerBuildRate: 0,
                shitRate: 0
            }
        }
    }

    decayOtherValues = (mutators, chosenKey) => {
        for(const i in POINT_CATEGORY_KEYS) {
            const key = POINT_CATEGORY_KEYS[i];
            if(key !== chosenKey && key.name !== "") {
                mutators[key] -= POINT_CATEGORIES[key].perPointBonus / POINT_CATEGORY_KEYS.length;
            }
        }
    }
}
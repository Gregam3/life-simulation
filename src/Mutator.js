import {randomKey, range} from "./Util";

const POINTS_TO_SPEND_START = 10;

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

export default class Mutator {
    generateRandomPointSpread() {
        range();
        let mutators = this.generateDefaultMutators();

        range(POINTS_TO_SPEND_START).forEach(i => {
            let pointCategory = POINT_CATEGORIES[randomKey(POINT_CATEGORIES)];
            mutators[pointCategory.name] += pointCategory.perPointBonus;
            mutators.pointDistribution[pointCategory.name]++;
        });

        console.log('Mutators', mutators);

        return mutators;
    }

    generateDefaultMutators = () => {
        return {
            visionRange: POINT_CATEGORIES.visionRange.default,
            hungerBuildRate: POINT_CATEGORIES.hungerBuildRate.default,
            shitRate: POINT_CATEGORIES.shitRate.default,
            pointDistribution: {
                total: 10,
                visionRange: 0,
                hungerBuildRate: 0,
                shitRate: 0
            }
        }
    }
}
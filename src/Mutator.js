const DEFAULT_VISION_RANGE = 3;
const DEFAULT_HUNGER_BUILD_RATE = 100;
const DEFAULT_SHIT_RATE = 1;
const POINTS_TO_SPEND_START = 10;

const POINT_CATEGORIES = {
    visionRange: {
        default: 3,
        perPointBonus: 1
    },
    hungerBuildRate: {
        default: 100,
        perPointBonus: 20
    },
    shitRate: {
        default: 1,
        perPointBonus: 0.2
    }

};

export default class Mutator {
    generateRandomPointSpread() {
        let mutators = this.generateDefaultMutators();

        for (let i in POINTS_TO_SPEND_START) {

        }

        return mutators;
    }

    generateDefaultMutators = () => {
        return {
            visionRange: 4,
            hungerBuildRate: 100,
            shitRate: 1
        }
    }
}
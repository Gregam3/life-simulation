const DEATH_HUNGER = 2000;

const X_INDEX_PATH = 0;
const Y_INDEX_PATH = 1;

const AGENT_TYPE = {
    Monkey: {

    },
    Apple: {

    },

};

export default class Agent {
    constructor(name, x, y, mutations) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.hunger = 0;
        this.currentPath = null;
        this.mutations = mutations;
        this.hasActedThisTimestep = false;
    }

    isDead = () => {
        return this.hunger > DEATH_HUNGER;
    }

    nextY() {
        if (!this.currentPath) {
            console.warn("Attempting to get next y with null path");
            return null;
        }

        return this.currentPath[0][Y_INDEX_PATH];
    }

    nextX() {
        if (!this.currentPath) {
            console.warn("Attempting to get next x with null path");
            return null;
        }

        return this.currentPath[0][X_INDEX_PATH];
    }

    setPath(path) {
        this.currentPath = path;
    }

    setHasActedThisTimeStep(hasActedThisTimeStep) {
        this.hasActedThisTimestep = hasActedThisTimeStep;
    }
}




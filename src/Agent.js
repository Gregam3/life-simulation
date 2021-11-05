export const CELL_TYPES = {
    Grass: {
        name: 'Grass',
        character: ' ',
        color: 'green',
        obstructs: false
    },
    Water: {
        name: 'Water',
        character: ' ',
        color: 'blue',
        obstructs: true
    },
    Fruit: {
        name: 'Fruit',
        character: '🍎',
        color: 'green',
        calories: 500,
        obstructs: false
    },
    Agent: {
        name: 'Agent',
        character: '🐒',
        color: 'green',
        obstructs: true,
        isAgent: true
    },
    Dead: {
        name: 'Dead',
        character: '🍖',
        color: 'green',
        calories: 2000,
        obstructs: false
    },
    Shit: {
        name: 'Shit',
        character: '💩',
        color: 'green'
    },
    FruitPlant: {
        name: 'FruitPlant',
        character: '🌱',
        color: 'green'
    }
}

const DEATH_HUNGER = 2000;

const X_INDEX_PATH = 0;
const Y_INDEX_PATH = 1;

export default class Agent {
    constructor(name, x, y, hunger) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.hunger = hunger;
        this.currentPath = null;
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
}




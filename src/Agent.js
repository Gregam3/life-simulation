export const CELL_TYPES = {
    Grass: {
        name: 'Grass',
        character: '🌱',
        color: 'green',
        obstructs: false
    },
    Water: {
        name: 'Water',
        character: '💧',
        color: 'blue',
        obstructs: true
    },
    Fruit: {
        name: 'Fruit',
        character: '🍎',
        color: 'red',
        calories: 500
    },
    Agent: {
        name: 'Agent',
        character: '🐒',
        color: 'brown',
        obstructs: true,
        isAgent: true
    },
    Dead: {
        name: 'Dead',
        character: '🍖',
        color: 'red',
        calories: 2000
    }
}

const DEATH_HUNGER = 2000;

export default class Agent {
    constructor(name, x, y, hunger) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.hunger = hunger;
        this.currentTarget = null;
    }

    isDead = () => this.hunger > DEATH_HUNGER;
}




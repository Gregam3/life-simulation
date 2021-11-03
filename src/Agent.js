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
        color: 'brown',
        calories: 500
    },
    Agent: {
        name: 'Agent',
        character: '🐒',
        color: 'red',
        obstructs: true,
        isAgent: true
    },
    Dead: {
        name: 'Dead',
        character: '🍖',
        color: 'white',
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
    }

    isDead = () => this.hunger > DEATH_HUNGER;
}




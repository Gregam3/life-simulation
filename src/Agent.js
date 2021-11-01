export const CELL_TYPES = {
    Grass: {
        characters: ['🌱'],
        color: 'green',
        obstructs: false
    },
    Water: {
        characters: ['💧'],
        color: 'blue',
        obstructs: true
    },
    Fruit: {
        characters: ['🍎'],
        color: 'brown',
        isEdible: true
    },
    Agent: {
        characters: ['🐒'],
        color: 'red',
        obstructs: true
    },
    Dead: {
        characters: ['💀'],
        color: 'white'
    }
}

export default class Agent {
    constructor(name, x, y, hunger) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.hunger = hunger;
    }
}


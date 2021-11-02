export const CELL_TYPES = {
    Grass: {
        character: '🌱',
        color: 'green',
        obstructs: false
    },
    Water: {
        character: '💧',
        color: 'blue',
        obstructs: true
    },
    Fruit: {
        character: '🍎',
        color: 'brown',
        isEdible: true
    },
    Agent: {
        character: '🐒',
        color: 'red',
        obstructs: true
    },
    Dead: {
        character: '💀',
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


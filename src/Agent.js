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
        isEdible: true
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

    isDead = () => this.hunger > 1;
}




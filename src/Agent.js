export const TILES = {
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
        fontSize: 15,
        obstructs: true
    }
}

class Agent {
    constructor(name, x, y, hunger) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.hunger = hunger;
    }
}


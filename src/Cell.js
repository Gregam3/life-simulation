import {beatsPercentage, random} from "./Util";
import Agent from "./Agent";

const updateCellType = (cell, type) => {
    cell.updateType(type);
    return type;
}

export const CELL_TYPES = {
    Grass: {},
    Water: {color: 'blue', obstructs: true, isGrassBased: false},
    FruitPlant: {
        character: '🌱', obstructs: true,
        shouldCellExpire: thisCell => thisCell.age >= 2 + random(3),
        onCellExpire: thisCell => updateCellType(thisCell, CELL_TYPES.Fruit)
    },
    Fruit: {
        character: '🍎', calories: 500,
        shouldCellExpire: thisCell => thisCell.age >= 8 + random(3),
        onCellExpire: thisCell => updateCellType(thisCell, CELL_TYPES.Grass)
    },
    Agent: {
        character: '🐒', obstructs: true, isAgent: true,
        shouldCellExpire: thisCell => thisCell.agent.hunger >= 2_000,
        onCellExpire: thisCell => updateCellType(thisCell, CELL_TYPES.Dead)
    },
    Dead: {
        character: '🍖', calories: 2000,
        shouldCellExpire: thisCell => thisCell.age >= 10,
        onCellExpire: thisCell => updateCellType(thisCell, CELL_TYPES.Bones)
    },
    Bones: {
        character: '🦴', calories: 800,
        shouldCellExpire: thisCell => thisCell.age >= 10,
        onCellExpire: thisCell => {
            thisCell.fertility += Math.random();
            updateCellType(thisCell, CELL_TYPES.Grass)
        }
    },
    Shit: {
        character: '💩',
        shouldCellExpire: thisCell => thisCell.age >= 5,
        onCellExpire: thisCell => {
            thisCell.fertility += Math.random() * 2;
            return updateCellType(thisCell, CELL_TYPES.Grass);
        }
    }
}

//set defaults
Object.keys(CELL_TYPES).forEach(key => {
    let cellType = CELL_TYPES[key];
    cellType.name = key;
    if (cellType.character === undefined) cellType.character = ' ';
    if (cellType.color === undefined) cellType.color = 'green';
    if (cellType.obstructs === undefined) cellType.obstructs = false;
    if (cellType.shouldCellExpire === undefined) cellType.shouldCellExpire = () => null;
    if (cellType.onCellExpire === undefined) cellType.onCellExpire = thisCell => thisCell;
    if (cellType.isGrassBased === undefined) cellType.isGrassBased = true;
});

const valueToStrongerGreenColor = value => {
    let greenValue = 255 - Math.min(180, Math.floor(value * 120));
    return `rgb(0, ${greenValue}, 0)`;
};

export default class Cell {
    constructor(type, y, x, agent = null) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.agent = agent;
        this.cellHistory = [];
        this.age = 0;
        this.fertility = 0;
        if (this.type.name !== 'Agent') {
            this.addItemToCellHistory();
        }
    }

    updateType(newType) {
        this.age = 0;
        this.type = newType;
        this.addItemToCellHistory(newType);
    }

    addItemToCellHistory(newType) {
        this.cellHistory.unshift({
            type: newType ? newType : this.type,
            agent: this.agent,
            fertility: this.fertility
        });
    }

    updateToAgent(agent) {
        if (this.type.calories > 0) {
            this.addItemToCellHistory(CELL_TYPES.Grass);
            agent.hunger -= this.type.calories;
        }

        this.agent = agent;
        this.type = CELL_TYPES.Agent;
        this.agent.currentPath.splice(0, 1);
    }

    updateToPreviousCell(timeStep) {
        if (timeStep === 1 && this.type.isAgent) {
            this.type = CELL_TYPES.Grass;
            this.agent = new Agent();
        } else if (this.cellHistory.length > 0) {
            this.type = this.cellHistory[0].type;
        }
    }

    getCellColour() {
        if (this.type.name === 'Grass') return valueToStrongerGreenColor(this.fertility);

        if (this.type.isGrassBased) return valueToStrongerGreenColor(this.cellHistory[0].fertility);

        return this.type.color;
    }
}
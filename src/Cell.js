/*
 *  Defaults: {
 *      character: ' ',
 *      color: 'green',
 *      obstructs: false,
 *      name: 'Name',
 *      shouldCellExpire: () => null,
 *      onCellExpire: thisCell => thisCell,
 *
 *  }
 */
import {beatsPercentage, random} from "./Util";
import Agent from "./Agent";

const updateCellType = (cell, type) => {
    cell.updateType(type);
    return type;
}

export const CELL_TYPES = {
    Grass: {},
    Water: {color: 'blue', obstructs: true},
    FruitPlant: {character: '🌱', obstructs: true,
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
        onCellExpire: thisCell => updateCellType(CELL_TYPES.Dead)
    },
    Dead: {
        character: '🍖', calories: 2000,
        shouldCellExpire: thisCell => thisCell.age >= 10,
        onCellExpire: thisCell => updateCellType(CELL_TYPES.Bones)
    },
    Bones: {
        character: '🦴', calories: 800,
        shouldCellExpire: thisCell => thisCell.age >= 10,
        onCellExpire: thisCell => updateCellType(CELL_TYPES.Grass)
    },
    Shit: {
        character: '💩',
        shouldCellExpire: thisCell => thisCell.age >= 5,
        onCellExpire: thisCell => {
            if(beatsPercentage(1 - thisCell.fertility)) return updateCellType(CELL_TYPES.FruitPlant);
            else return updateCellType(CELL_TYPES.Grass);
        }
    }
}

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
        this.cellHistory.unshift({type: newType ? newType : this.type, agent: this.agent});
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
}
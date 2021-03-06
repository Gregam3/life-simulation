import React from "react";
import Agent from "./Agent";
import Cell, {CELL_TYPES} from "./Cell";
import {random, randomKey} from "./Util";
import {generateCellsInRange} from "./BehaviourController";

const range = (i) => {
    return [...Array(i).keys()];
}

const invertKeys = (json) => {
    const ret = {};
    for (const key in json) {
        ret[json[key]] = key;
    }
    return ret;
}

Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}

const deepClone = obj => Object.assign({}, obj);

const DIRECTIONS = {
    1: {
        name: 'UP_LEFT',
        transform: {xChange: -1, yChange: -1}
    },
    2: {
        name: 'UP',
        transform: {xChange: 0, yChange: -1}
    },
    3: {
        name: 'UP_RIGHT',
        transform: {xChange: 1, yChange: 1}
    },
    4: {
        name: 'LEFT',
        transform: {xChange: -1, yChange: 0}
    },
    5: {
        name: 'RIGHT',
        transform: {xChange: 1, yChange: 0}
    },
    6: {
        name: 'DOWN_LEFT',
        transform: {xChange: -1, yChange: 1}
    },
    7: {
        name: 'DOWN',
        transform: {xChange: 0, yChange: 1}
    },
    8: {
        name: 'DOWN_RIGHT',
        transform: {xChange: 1, yChange: 1}
    },
    0: {
        name: 'CANCEL',
        transform: {xChange: 0, yChange: 0}
    }
}

export const safeUpdateCells = (cells, x, y, newType) => {
    if (x > cells[0].length - 1 || y > cells.length - 1 || x < 0 || y < 0) return null;

    let clonedCells = cells;

    clonedCells[y][x].updateType(newType);
    return clonedCells;
}

export const safeGetCell = (cells, x, y) => {
    if (x > cells[0].length - 1 || y > cells.length - 1 || x < 0 || y < 0) return null;

    return cells[y][x];
}

export const getCellsOfTypeFromProvided = (cells, cellType) => {
    return cells.flatMap(row => row).filter(cell => cell.type.name === cellType.name);
}

//generation parameters
const NAMES = ['Sona', 'Greg', 'Corey', 'Beth', 'Ryxxed', 'Meloonius', 'Agent J', 'Honeybadger', 'Augie', 'Indy', 'Sabine', 'Cotton', 'Flash', 'Whiskey', 'Titus', 'Murphy', 'Astro', 'Amber', 'Godiva', 'Arnie', 'Cobweb', 'Joe', 'Maxine', 'Chi Chi', 'Ryder', 'Bruno', 'Genie', 'Gypsy', 'Wilber', 'Blast', 'Skippy', 'Honey', 'Elvis', 'Solomon', 'Powder', 'Maggie', 'Einstein', 'Quinn', 'Fonzie', 'Clancy', 'Maxwell', 'Natasha', 'Flopsy', 'Presley', 'Penny', 'Tanner', 'Amy', 'Goldie', 'Kelly', 'Butch', 'Ringo', 'Puppy', 'Jersey', 'Chief', 'Kipper', 'Abbey', 'Scooby-doo', 'Chip', 'Abel', 'Sweetie', 'Porky', 'Jelly', 'Paris', 'Silver', 'Maggie-mae', 'Nana', 'Sally', 'Sophie', 'Barbie', 'Chippy', 'Guido', 'Vegas', 'Ziggy', 'Casper', 'Binky', 'Finnegan', 'Gretchen', 'Bucko', 'Poppy', 'Pudge', 'Shaggy', 'Bubba', 'Bessie', 'Summer', 'Bug', 'Monster', 'Dreamer', 'Scout', 'Patsy', 'Kobe', 'Toni', 'Willy', 'Tigger', 'Angel', 'Bosco', 'Kona', 'Chad', 'Tiger', 'Guy', 'Kerry', 'Tiki', 'Picasso', 'Miasy', 'Titan', 'Charlie', 'Mitzi', 'Layla'];

class Environment {
    constructor(width, height, generationOptions) {
        this.width = width;
        this.height = height;
        this.generationOptions = generationOptions;
        this.cells = this.generateEnvironment();
        this.debugAgentName = "";
    }

    generateEnvironment() {
        console.log('Generating environment')
        const grassPlaneCells = this.createGrassPlaneCells();
        const withWaterCells = this.populateWater(grassPlaneCells);
        this.setCellFertilities(withWaterCells);
        return this.populateAgents(withWaterCells);
    }

    createGrassPlaneCells() {
        return range(this.height).map(y => range(this.width).map(x => new Cell(CELL_TYPES.Grass, y, x)));
    }

    populateWater(cells) {
        for (let i = 0; i < this.generationOptions.waterBodies; i++) {
            let x = random(this.width);
            let y = random(this.height);

            let validDirections = deepClone(DIRECTIONS);

            let directionKey = randomKey(validDirections);
            let direction = validDirections[directionKey];

            while (direction !== DIRECTIONS[0] || Object.keys(validDirections).length === 0) {
                let updatedCells = safeUpdateCells(cells,
                    x + direction.transform.xChange,
                    y + direction.transform.yChange,
                    CELL_TYPES.Water);

                if (updatedCells === null) {
                    delete validDirections[directionKey];
                } else {
                    x = x + direction.transform.xChange;
                    y = y + direction.transform.yChange;

                    cells = safeUpdateCells(cells, x, y, CELL_TYPES.Water);
                    validDirections = deepClone(DIRECTIONS);
                }

                direction = validDirections[randomKey(validDirections)];
            }
        }

        return cells;
    }

    populateFruit(cells) {
        return cells.map(rows => rows.map(cell => {
            const r = random(this.generationOptions.treeChance1InX);
            if (cell.type === CELL_TYPES.Grass && r === this.generationOptions.treeChance1InX) {
                cell.updateType(CELL_TYPES.Fruit);
            }
            return cell;
        }));
    }

    populateAgents(cells) {
        let newCells = cells;

        range(this.generationOptions.agentSpawnCount).forEach(i => {
            let toBeAgentCell = getCellsOfTypeFromProvided(newCells, CELL_TYPES.Grass).random();
            toBeAgentCell.type = CELL_TYPES.Agent;
            toBeAgentCell.agent = new Agent(NAMES.random(), toBeAgentCell.x, toBeAgentCell.y, this.generationOptions.agentMutations);
        });

        return newCells;
    }

    getCellsOfType(cellType) {
        return this.cells.flatMap(row => row).filter(cell => cell.type.name === cellType.name);
    }

    setCellFertilities(withWaterCells) {
        getCellsOfTypeFromProvided(withWaterCells, CELL_TYPES.Grass)
            .forEach(cell => cell.fertility = this.getCellFertility(cell, withWaterCells))
    }

    getCellFertility(cell, withWaterCells) {
        let halfWidth = Math.floor(this.width / 2);
        for (let i = 1; i <= halfWidth; i++) {
            if (generateCellsInRange(cell, withWaterCells, i).some(c => c.type === CELL_TYPES.Water)) return 0.8 / i + (Math.random() * .5);
        }
    }
}

export default Environment;
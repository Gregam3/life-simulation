import React from "react";
import Agent, {TILES} from "./Agent";
import Cell from "./Cell";

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

const random = (max, min = 0) => {
    return min + Math.floor(Math.random() * (max - min) + 1);
}

const randomKey = function (obj) {
    var keys = Object.keys(obj);
    return keys[keys.length * Math.random() << 0];
};

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

export const safeUpdateCells = (cells, x, y, newTile) => {
    if (x > cells[0].length - 1 || y > cells.length - 1 || x < 0 || y < 0) return null;

    let clonedCells = cells;

    clonedCells[y][x].type = newTile;
    return clonedCells;
}

export const safeGetCell = (cells, x, y) => {
    if (x > cells[0].length - 1 || y > cells.length - 1 || x < 0 || y < 0) return null;

    return cells[y][x];
}

//generation parameters
const WATER_BODIES = 50;
const TREE_CHANCE_ONE_IN_X = 10;
const AGENT_CHANCE_ONE_IN_X = 35;

const NAMES = ['Augie','Indy','Sabine','Cotton','Flash','Whiskey','Titus','Murphy','Astro','Amber','Godiva','Arnie','Cobweb','Joe','Maxine','Chi Chi','Ryder','Bruno','Genie','Gypsy','Wilber','Blast','Skippy','Honey','Elvis','Solomon','Powder','Maggie','Einstein','Quinn','Fonzie','Clancy','Maxwell','Natasha','Flopsy','Presley','Penny','Tanner','Amy','Goldie','Kelly','Sissy','Butch','Ringo','Puppy','Jersey','Chief','Kipper','Abbey','Scooby-doo','Chip','Abel','Sweetie','Porky','Jelly','Paris','Silver','Maggie-mae','Nana','Sally','Sophie','Barbie','Chippy','Guido','Vegas','Ziggy','Casper','Binky','Finnegan','Gretchen','Bucko','Poppy','Pudge','Shaggy','Bubba','Bessie','Summer','Bug','Monster','Dreamer','Scout','Patsy','Kobe','Toni','Willy','Tigger','Angel','Bosco','Kona','Chad','Tiger','Guy','Kerry','Tiki','Picasso','Miasy','Titan','Charlie','Mitzi','Layla'];

class Environment {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cells = this.generateEnvironment();
    }

    generateEnvironment() {
        console.log('Generating environment')
        const grassPlaneCells = this.createGrassPlaneCells();
        const withWaterCells = this.populateWater(grassPlaneCells);
        const withTreeCells = this.populateFruit(withWaterCells);
        return this.populateAgents(withTreeCells);
    }

    createGrassPlaneCells() {
        console.log(this.height, this.width)
        return range(this.height).map(y => range(this.width).map(x => new Cell(TILES.Grass, y, x)));
    }

    populateWater(cells) {
        for (let i = 0; i < WATER_BODIES; i++) {
            let x = random(this.width);
            let y = random(this.height);

            let validDirections = deepClone(DIRECTIONS);

            let directionKey = randomKey(validDirections);
            let direction = validDirections[directionKey];

            while (direction !== DIRECTIONS[0] || Object.keys(validDirections).length === 0) {
                let updatedCells = safeUpdateCells(cells,
                    x + direction.transform.xChange,
                    y + direction.transform.yChange,
                    TILES.Water);

                if (updatedCells === null) {
                    console.info('Invalid direction', direction.name);
                    delete validDirections[directionKey];
                } else {
                    x = x + direction.transform.xChange;
                    y = y + direction.transform.yChange;
                    console.info('Valid direction', direction.name, 'New x y', x, y);

                    cells = safeUpdateCells(cells, x, y, TILES.Water);
                    validDirections = deepClone(DIRECTIONS);
                }

                direction = validDirections[randomKey(validDirections)];
                console.info('New direction', direction.name);
            }
        }

        return cells;
    }

    populateFruit(cells) {
        return cells.map(rows => rows.map(cell => {
            const r = random(TREE_CHANCE_ONE_IN_X);
            if (cell.type === TILES.Grass && r === TREE_CHANCE_ONE_IN_X) {
                cell.type = TILES.Fruit;
            }
            return cell;
        }));
    }

    populateAgents(cells) {
        return cells.map(rows => rows.map(cell => {
            const r = random(AGENT_CHANCE_ONE_IN_X);
            if (cell.type === TILES.Grass && r === AGENT_CHANCE_ONE_IN_X) {
                cell.type = TILES.Agent;
                cell.agent = new Agent(NAMES[0], cell.x, cell.y, 1.0);
                delete NAMES[0];
            }
            return cell;
        }));
    }

    getCellsOfType(cellType) {
        return this.cells.flatMap(row => row).filter(cell => cell.type === cellType);
    }
}

export default Environment;
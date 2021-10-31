import React from "react";

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
    return this[Math.floor((Math.random()*this.length))];
}

const random = (max, min = 0) => {
    return min + Math.floor(Math.random() * (max - min) + 1);
}

const randomKey = function (obj) {
    var keys = Object.keys(obj);
    return keys[keys.length * Math.random() << 0];
};

const deepClone = obj => Object.assign({}, obj);

const TILES = {
    Grass: {
        characters: ['M'],
        color: 'green'
    },
    Water: {
        characters: ['~'],
        color: 'blue'
    },
    Tree: {
        characters: ['T'],
        color: 'brown'
    },
    Agent: {
        characters: ['🙂'],
        color: 'red',
        fontSize: 15
    }
}

const   DIRECTIONS = {
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

const safeUpdateCells = (cells, x, y, newTile) => {
    if (x > cells[0].length - 1 || y > cells.length - 1 || x < 0 || y < 0) return null;

    let clonedCells = cells;
    console.info(cells, clonedCells, x, y);

    clonedCells[y][x].type = newTile;
    return clonedCells;

}

//generation parameters
const WATER_BODIES = 50;
const TREE_CHANCE_ONE_IN_X = 10;
const AGENT_CHANCE_ONE_IN_X = 100;

class Environment {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    generateEnvironment() {
        console.log('Generating environment')
        const grassPlaneCells = this.createGrassPlaneCells();
        const withWaterCells = this.populateWater(grassPlaneCells);
        const withTreeCells = this.populateTrees(withWaterCells);
        return this.populateAgents(withTreeCells);
    }

    createGrassPlaneCells() {
        console.log(this.height, this.width)
        return range(this.height).map(x => range(this.width).map(y => {
            return {
                type: TILES.Grass,
                x: x, y: y
            }
        }));
    }

    populateWater(cells) {
        for (let i = 0; i < WATER_BODIES; i++) {
            let x = random(this.width);
            let y = random(this.height);

            let validDirections = deepClone(DIRECTIONS);

            let directionKey = randomKey(validDirections);
            let direction = validDirections[directionKey];
            console.log(direction, validDirections);

            while (direction !== DIRECTIONS[0] || Object.keys(validDirections).length === 0) {
                console.info('inside while', directionKey)
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
                    validDirections = DIRECTIONS;
                }

                direction = validDirections[randomKey(validDirections)];
                console.info('New direction', direction.name);
            }
        }

        return cells;
    }

    populateTrees(cells) {
        return cells.map(rows => rows.map(cell => {
            const r = random(TREE_CHANCE_ONE_IN_X);
            if (cell.type === TILES.Grass && r === TREE_CHANCE_ONE_IN_X) {
                cell.type = TILES.Tree;
            }
            return cell;
        }));
    }

    populateAgents(cells) {
        return cells.map(rows => rows.map(cell => {
            const r = random(AGENT_CHANCE_ONE_IN_X);
            if (cell.type === TILES.Grass && r === AGENT_CHANCE_ONE_IN_X) {
                cell.type = TILES.Agent;
            }
            return cell;
        }));
    }
}

export default Environment;
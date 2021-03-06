import {CELL_TYPES} from "./Cell";
import _ from "lodash";
import Pather from "./Pather";
import {beatsPercentage, random, randomBooleanByPercentage, weightedRandom} from "./Util";

const Util = require("./Util");

const cartesianProduct = items =>
    items.flatMap(outerIndex => items.flatMap(innerIndex => [{xChange: innerIndex, yChange: outerIndex}]));

export const safeGetCell = (cells, x, y) => {
    if (x > cells[0].length - 1 || y > cells.length - 1 || x < 0 || y < 0) return null;

    return cells[y][x];
}

export const getCellsOfTypeFromProvided = (cells, cellType) => {
    return cells.flatMap(row => row).filter(cell => cell.type.name === cellType.name);
}

const generateSurroundingCells = visionRange => cartesianProduct(_.range(visionRange, visionRange * -1));
export const generateCellsInSightRange = (cell, cells) => {
    return generateSurroundingCells(cell.agent.mutations.visionRange).flatMap(positionChange => safeGetCell(
            cells,
            cell.x + positionChange.xChange,
            cell.y + positionChange.yChange
        )
    ).filter(cell => cell !== null);
}

export const generateCellsInRange = (cell, cells, range) => {
    return generateSurroundingCells(range).flatMap(positionChange => safeGetCell(
            cells,
            cell.x + positionChange.xChange,
            cell.y + positionChange.yChange
        )
    ).filter(cell => cell !== null);
}

const movementRange = cartesianProduct(Util.trueRange(1, -1));
const PATHER = new Pather();
const MAX_TIME_STEP = 300;

const MAX_FRUIT_COUNT = 10;
export default class BehaviourController {
    processTimeStep(environment, timeStep) {
        this.log('Time step:' + timeStep + ", agent count=" + environment.getCellsOfType(CELL_TYPES.Agent).length);
        environment = this.processAgentBehaviour(environment, timeStep);

        return environment;
    }

    processAgentBehaviour(environment, timeStep) {
        let agentCells = environment.getCellsOfType(CELL_TYPES.Agent);

        agentCells.forEach(agentCell => {
            agentCell.agent.hunger += (100 - agentCell.agent.mutations.reduceHungerBuildRate);

            if (!environment.debugAgentName) {
                this.log('[y=' + agentCell.y + '|x=' + agentCell.x + '] name=' + agentCell.agent.name + ", hunger=" + agentCell.agent.hunger);
            } else if (agentCell.agent.name === environment.debugAgentName) {
                this.log('[y=' + agentCell.y + '|x=' + agentCell.x + '] name=' + agentCell.agent.name + ", hunger=" + agentCell.agent.hunger);
            }

            if (agentCell.agent.hunger > 2000) {
                this.log(agentCell.agent.name + " has died of hunger")
                agentCell.updateType(CELL_TYPES.Dead)
            }
        });

        if (agentCells.length === 0 || timeStep >= MAX_TIME_STEP) {
            environment.end = true;
            return environment;
        }

        environment.cells = this.simulateChangeInCells(environment, timeStep);

        return environment;
    }

    simulateChangeInCells(environment, timeStep) {
        environment.getCellsOfType(CELL_TYPES.Agent).forEach(cell => cell.agent.setHasActedThisTimeStep(false));
        const clonedCells = _.cloneDeep(environment.cells);
        const clonedEnvironment = _.cloneDeep(environment);

        clonedCells.forEach(row => row.forEach(cell => {
            if (cell.agent && cell.agent.name === environment.debugAgentName) {
                this.log();
            }

            cell.age++;
            switch (cell.type.name) {
                case 'Agent':
                    this.simulateAgentAction(cell, clonedCells, timeStep, clonedEnvironment);
                    break;
                default:
                    if(cell.type.shouldCellExpire(cell)) cell.type.onCellExpire(cell);
                    break;
            }
        }));

        this.growFruitRandomly(environment, clonedCells);

        return clonedCells;
    }

    growFruitRandomly(environment, clonedCells) {
        let fruitCells = getCellsOfTypeFromProvided(clonedCells, CELL_TYPES.Fruit);

        if (fruitCells.length < MAX_FRUIT_COUNT) {
            let numberOfItemsToTurnToFruit = 0;

            while(beatsPercentage(.8)) {
                numberOfItemsToTurnToFruit++;
            }

            let grassCells = getCellsOfTypeFromProvided(clonedCells, CELL_TYPES.Grass);

            if (grassCells.length > 0) {
                Util.range(numberOfItemsToTurnToFruit).forEach(i => grassCells.random().updateType(CELL_TYPES.FruitPlant));
                grassCells.filter(cell => cell.fertility >= 1).forEach(cell =>{
                    cell.updateType(CELL_TYPES.FruitPlant);
                    cell.fertility -= 1;
                });
            }
        }
    }

    simulateAgentAction(agentCell, clonedCells, timeStep, clonedEnvironment) {
        if (agentCell.agent.hasActedThisTimestep === false) {
            if (clonedEnvironment.debugAgentName === agentCell.agent.name) {
                this.log();
            }

            clonedEnvironment.cells = clonedCells;
            this.generatePathToFood(agentCell, clonedEnvironment)

            let agentCellClone = _.cloneDeep(agentCell);
            agentCellClone.agent.setHasActedThisTimeStep(true);

            if (agentCell.agent.currentPath && agentCell.agent.currentPath.length > 0) {
                const currentAgentCell = clonedCells[agentCell.y][agentCell.x];
                const newAgentCell = clonedCells[agentCell.agent.nextY()][agentCell.agent.nextX()];
                currentAgentCell.updateToPreviousCell(timeStep);
                if (this.shouldAgentShit(agentCellClone.agent)) {
                    currentAgentCell.updateType(CELL_TYPES.Shit);
                }
                newAgentCell.updateToAgent(agentCellClone.agent);
            }
        }
    }

    shouldAgentShit(agent) {
        let max = 20 * (2000 / (Math.abs(2000 - agent.hunger)));
        return weightedRandom(0, max) > (max * (1 - (agent.mutations.shitRate * 0.2)));
    }

    generatePathToFood(agentCell, environment) {
        if (environment.debugAgentName === agentCell.agent.name) {
            this.log();
        }

        let pathToFood = this.getPathToFood(agentCell, environment);
        if (pathToFood === null || pathToFood.length === 0) {
            //For now move randomly if no food found
            let randomTargetCell = this.generateCellsInMovementRange(agentCell, environment.cells).random();
            let newPath = PATHER.generatePath(agentCell, randomTargetCell, environment);
            agentCell.agent.setPath(newPath);
        } else if (!agentCell.agent.currentPath || agentCell.agent.currentPath.length === 0 || pathToFood.length <= agentCell.agent.currentPath.length) {
            agentCell.agent.setPath(pathToFood);
        }
    }

    getPathToFood(agentCell, environment) {
        const cellsInSenseRange = generateCellsInSightRange(agentCell, environment.cells);
        const foodCellsInRange = cellsInSenseRange.filter(cell => cell.type.calories > 0).sort(cell => cell.type.calories).reverse();

        if (foodCellsInRange.length > 0) {
            let newTargetCell = foodCellsInRange.random();
            return PATHER.generatePath(agentCell, newTargetCell, environment);
        }

        return null;
    }

    generateCellsInMovementRange = (agentCell, cells) => {
        return movementRange.flatMap(positionChange => safeGetCell(
                cells,
                agentCell.x + positionChange.xChange,
                agentCell.y + positionChange.yChange
            )
        ).filter(cell => cell !== null && !cell.type.obstructs);
    }

    navigateAsCrowFlies(agent, targetCell) {
        let xChange = 0;
        let yChange = 0;

        if (agent.x < targetCell.x) xChange++;
        else if (agent.x > targetCell.x) xChange--;

        if (agent.y < targetCell.y) yChange++;
        else if (agent.y > targetCell.y) yChange--;

        return {
            xChange,
            yChange
        }
    }

    simulateDeadAction(cell, clonedCells, timeStep) {
        if (cell.age > 5 + random(10, 5)) {
            cell.updateType(CELL_TYPES.Bones);
        }
    }

    log(content) {
        if (false) {
            console.log(content);
        }
    }

    simulateFruit(cell, clonedCells, timeStep) {
        if (cell.age > 10 + random(10, 5)) cell.updateType(CELL_TYPES.Grass)
    }
}
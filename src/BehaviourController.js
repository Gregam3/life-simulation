import {CELL_TYPES} from "./Agent";
import _ from "lodash";
import Pather from "./Pather";
import * as path from "path";
import {random, randomBooleanByPercentage, weightedRandom} from "./Util";

const Util = require("./Util");
const {safeGetCell} = require("./Environment");

const cartesianProduct = items =>
    items.flatMap(outerIndex => items.flatMap(innerIndex => [{xChange: innerIndex, yChange: outerIndex}]));

const visionRange = cartesianProduct(Util.trueRange(2, -2));
const movementRange = cartesianProduct(Util.trueRange(1, -1));

const PATHER = new Pather();
export default class BehaviourController {
    processTimeStep(environment, timeStep) {
        console.log('timeStep:' + timeStep)
        environment = this.processAgentBehaviour(environment, timeStep);

        return environment;
    }

    processAgentBehaviour(environment, timeStep) {
        let agentCells = environment.getCellsOfType(CELL_TYPES.Agent);

        agentCells.forEach(agentCell => {
            agentCell.agent.hunger += 100
            console.log('Monkey name=' + agentCell.agent.name + " hunger=" + agentCell.agent.hunger, agentCell.x, agentCell.y, agentCell.agent.hunger);
            if (agentCell.agent.hunger > 2000) {
                agentCell.type = CELL_TYPES.Dead
            }
        });

        if (agentCells.length === 0) {
            environment.end = true;
            return environment;
        }

        agentCells.forEach(agentCell => this.generatePathToFood(agentCell, environment));

        environment.cells = this.simulateActions(environment.cells, timeStep);

        return environment;
    }

    simulateActions(cells, timeStep) {
        const clonedCells = _.cloneDeep(cells);

        clonedCells.forEach(row => row.forEach(cell => {
            cell.age++;
            switch (cell.type.name) {
                case 'Agent': this.simulateAgentAction(cell, clonedCells, timeStep);break;
                case 'Shit': this.simulateShitAction(cell, clonedCells, timeStep);break;
                case 'FruitPlant': this.simulateFruitPlantAction(cell, clonedCells, timeStep);break;
                default: break;
            }
        }));

        return clonedCells;
    }

    simulateAgentAction(agentCell, clonedCells, timeStep) {
        let agentCellClone = _.cloneDeep(agentCell);

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

    simulateShitAction(shitCell, clonedCells, timeStep) {
        if (shitCell.age > 5) {
            if(randomBooleanByPercentage(0.5)) {
                shitCell.updateType(CELL_TYPES.FruitPlant);
            } else {
                shitCell.updateType(CELL_TYPES.Grass);
            }
        }
    }

    simulateFruitPlantAction(fruitPlantCell, clonedCells, timeStep) {
        if (fruitPlantCell.age > 2 && random(1, 0) === 1) {
            fruitPlantCell.updateType(CELL_TYPES.Fruit);
        }
    }

    shouldAgentShit(agent) {
        let max = 20 * (2000 / (Math.abs(2000 - agent.hunger)));
        return weightedRandom(0, max) > (max * 0.8);
    }

    generatePathToFood(agentCell, environment) {
        let pathToFood = this.getPathToFood(agentCell, environment);
        if (pathToFood === null) {
            //For now move randomly if no food found
            let randomTargetCell = this.generateCellsInMovementRange(agentCell, environment.cells).random();
            let newPath = PATHER.generatePath(agentCell, randomTargetCell, environment);
            agentCell.agent.setPath(newPath);
        } else if (!agentCell.agent.currentPath || agentCell.agent.currentPath.length > 0 || pathToFood.length < agentCell.agent.currentPath.length) {
            agentCell.agent.setPath(pathToFood);
        }
    }

    getPathToFood(agentCell, environment) {
        const cellsInSenseRange = this.generateCellsInSightRange(agentCell, environment.cells);
        const foodCellsInRange = cellsInSenseRange.filter(cell => cell.type.calories > 0).sort(cell => cell.type.calories).reverse();

        if (foodCellsInRange.length > 0) {
            let newTargetCell = foodCellsInRange.random();
            return PATHER.generatePath(agentCell, newTargetCell, environment);
        }

        return null;
    }

    generateCellsInSightRange = (agentCell, cells) => {
        return visionRange.flatMap(positionChange => safeGetCell(
                cells,
                agentCell.x + positionChange.xChange,
                agentCell.y + positionChange.yChange
            )
        ).filter(cell => cell !== null);
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
}
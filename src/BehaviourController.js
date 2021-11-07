import {CELL_TYPES} from "./Agent";
import _ from "lodash";
import Pather from "./Pather";
import * as path from "path";
import {random, randomBooleanByPercentage, weightedRandom} from "./Util";

const Util = require("./Util");
const {safeGetCell} = require("./Environment");

const cartesianProduct = items =>
    items.flatMap(outerIndex => items.flatMap(innerIndex => [{xChange: innerIndex, yChange: outerIndex}]));

const generateVisionRange = visionRange => cartesianProduct(_.range(visionRange, visionRange * -1));
const movementRange = cartesianProduct(Util.trueRange(1, -1));


const PATHER = new Pather();
export default class BehaviourController {
    processTimeStep(environment, timeStep) {
        console.log('Time step:' + timeStep + ", agent count=" + environment.getCellsOfType(CELL_TYPES.Agent).length);
        environment = this.processAgentBehaviour(environment, timeStep);

        return environment;
    }

    processAgentBehaviour(environment, timeStep) {
        let agentCells = environment.getCellsOfType(CELL_TYPES.Agent);

        agentCells.forEach(agentCell => {
            agentCell.agent.hunger += agentCell.agent.mutations.hungerBuildRate;

            if (!environment.debugAgentName) {
                console.log('[y=' + agentCell.y + '|x=' + agentCell.x + '] name=' + agentCell.agent.name + ", hunger=" + agentCell.agent.hunger);
            } else if (agentCell.agent.name === environment.debugAgentName) {
                console.log('[y=' + agentCell.y + '|x=' + agentCell.x + '] name=' + agentCell.agent.name + ", hunger=" + agentCell.agent.hunger);
            }

            if (agentCell.agent.hunger > 2000) {
                console.log(agentCell.agent.name + " has died of hunger")
                agentCell.updateType(CELL_TYPES.Dead)
            }
        });

        if (agentCells.length === 0) {
            environment.end = true;
            return environment;
        }

        environment.cells = this.simulateActions(environment, timeStep);

        return environment;
    }

    simulateActions(environment, timeStep) {
        environment.getCellsOfType(CELL_TYPES.Agent).forEach(cell => cell.agent.setHasActedThisTimeStep(false));
        const clonedCells = _.cloneDeep(environment.cells);
        const clonedEnvironment = _.cloneDeep(environment);

        clonedCells.forEach(row => row.forEach(cell => {
            if (cell.agent && cell.agent.name === environment.debugAgentName) {
                console.log();
            }

            cell.age++;
            switch (cell.type.name) {
                //TODO put inside of types themselves
                case 'Agent':
                    this.simulateAgentAction(cell, clonedCells, timeStep, clonedEnvironment);
                    break;
                case 'Shit':
                    this.simulateShitAction(cell, clonedCells, timeStep);
                    break;
                case 'FruitPlant':
                    this.simulateFruitPlantAction(cell, clonedCells, timeStep);
                    break;
                case 'Dead':
                    this.simulateDeadAction(cell, clonedCells, timeStep);
                    break;
                default:
                    break;
            }
        }));

        return clonedCells;
    }

    simulateAgentAction(agentCell, clonedCells, timeStep, clonedEnvironment) {
        if (agentCell.agent.hasActedThisTimestep === false) {
            if (clonedEnvironment.debugAgentName === agentCell.agent.name) {
                console.log();
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

    simulateShitAction(shitCell, clonedCells, timeStep) {
        if (shitCell.age > 5) {
            if (randomBooleanByPercentage(0.5)) {
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
        return weightedRandom(0, max) > (max * (1 - (agent.mutations.shitRate * 0.2)));
    }

    generatePathToFood(agentCell, environment) {
        if (environment.debugAgentName === agentCell.agent.name) {
            console.log();
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
        const cellsInSenseRange = this.generateCellsInSightRange(agentCell, environment.cells);
        const foodCellsInRange = cellsInSenseRange.filter(cell => cell.type.calories > 0).sort(cell => cell.type.calories).reverse();

        if (foodCellsInRange.length > 0) {
            let newTargetCell = foodCellsInRange.random();
            return PATHER.generatePath(agentCell, newTargetCell, environment);
        }

        return null;
    }

    generateCellsInSightRange = (agentCell, cells) => {
        return generateVisionRange(agentCell.agent.mutations.visionRange).flatMap(positionChange => safeGetCell(
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

    simulateDeadAction(cell, clonedCells, timeStep) {
        if (cell.age > 5 + random(10, 5)) {
            cell.updateType(CELL_TYPES.Bones);
        }
    }
}
import {CELL_TYPES} from "./Agent";
import _ from "lodash";
import Pather from "./Pather";
import * as path from "path";

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
            if (agentCell.agent.isDead()) agentCell.type = CELL_TYPES.Dead
        });

        if (agentCells.length === 0) {
            environment.end = true;
            return environment;
        }

        //Filters out Dead agents
        agentCells = environment.getCellsOfType(CELL_TYPES.Agent);
        agentCells.forEach(agentCell => this.generatePathToFood(agentCell, environment));

        environment.cells = this.simulateAgentMovements(agentCells, environment.cells, timeStep);

        return environment;
    }

    simulateAgentMovements(agentCells, cells, timeStep) {
        const clonedCells = _.cloneDeep(cells);
        agentCells.forEach(agentCell => {
            if (agentCell.agent.currentPath.length > 0) {
                const currentAgentCell = clonedCells[agentCell.y][agentCell.x];
                currentAgentCell.updateToPreviousCell(timeStep);
                const newAgentCell = clonedCells[agentCell.agent.nextY()][agentCell.agent.nextX()];
                agentCell.agent.currentPath.splice(0, 1);
                newAgentCell.updateToAgent(agentCell.agent);
            }
        });

        return clonedCells;
    }

    generatePathToFood(agentCell, environment) {
        let pathToFood = this.getPathToFood(agentCell, environment);
        if (pathToFood === null) {
            //For now move randomly if no food found
            let randomTargetCell = this.generateCellsInMovementRange(agentCell, environment.cells).random();
            agentCell.agent.currentPath = PATHER.generatePath(agentCell, randomTargetCell, environment);
        } else if (agentCell.agent.currentPath === null || pathToFood.length < agentCell.agent.currentPath.length) {
            agentCell.agent.currentPath = pathToFood;
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
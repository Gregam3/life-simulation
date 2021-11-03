import {CELL_TYPES} from "./Agent";
import _ from "lodash";
import Pather from "./Pather";

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
        const agentCells = environment.getCellsOfType(CELL_TYPES.Agent);

        agentCells.forEach(agentCell => {
            agentCell.agent.hunger += 100
            console.log('Monkey name=' + agentCell.agent.name + " hunger=" + agentCell.agent.hunger, agentCell.x, agentCell.y, agentCell.agent.hunger);
            if (agentCell.agent.isDead()) agentCell.type = CELL_TYPES.Dead
        });

        if (agentCells.length === 0) {
            environment.end = true;
            return environment;
        }

        const agentPaths = this.generateAgentMovementPaths(agentCells, environment);

        environment.cells = this.simulateAgentMovements(agentPaths, environment.cells, timeStep);

        return environment;
    }

    simulateAgentMovements(agentPaths, cells, timeStep) {
        const clonedCells = _.cloneDeep(cells);
        agentMovements.forEach(agentMovement => {
            const currentAgentCell = clonedCells[agentMovement.agentCell.y][agentMovement.agentCell.x];
            currentAgentCell.updateToPreviousCell(timeStep);
            let newAgentCell = clonedCells[agentMovement.agentCell.y + agentMovement.movement.yChange][agentMovement.agentCell.x + agentMovement.movement.xChange];
            newAgentCell.updateToAgent(agentMovement.agentCell.agent);
        });

        return clonedCells;
    }

    generateAgentMovementPaths(agentCells, environment) {


        return agentCells.filter(agentCell => !agentCell.agent.isDead()).map(agentCell => {
            return {
                agentCell,
                path: this.generatePathToFood(agentCell, environment)
            }
        });
    }

    generatePathToFood(agent, environment) {
        if (!agent.currentTarget) {
            const cellsInSenseRange = this.generateCellsInSightRange(agent, environment.cells);
            const foodCellsInRange = cellsInSenseRange.filter(cell => cell.type.calories > 0).sort(cell => cell.type.calories).reverse();

            if (foodCellsInRange.length > 0) {
                let newTargetCell = foodCellsInRange.random();
                agent.currentTarget = newTargetCell;
                return this.navigateTowards(agent, environment, newTargetCell);
            }
        } else {
            return this.navigateTowards(agent, environment, agent.currentTarget);
        }

        //For now move randomly if no food found
        return this.navigateTowards(agent, environment, this.generateCellsInMovementRange(agent, environment.cells).random());
    }

    generateCellsInSightRange = (agent, cells) => {
        return visionRange.flatMap(positionChange => safeGetCell(
                cells,
                agent.x + positionChange.xChange,
                agent.y + positionChange.yChange
            )
        ).filter(cell => cell !== null);
    }

    generateCellsInMovementRange = (agent, cells) => {
        return movementRange.flatMap(positionChange => safeGetCell(
                cells,
                agent.x + positionChange.xChange,
                agent.y + positionChange.yChange
            )
        ).filter(cell => cell !== null);
    }

    navigateTowards(agent, environment, targetCell) {
        return PATHER.generatePath(agent, targetCell, environment);
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
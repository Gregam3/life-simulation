import {CELL_TYPES} from "./Agent";
import _ from "lodash";

const Util = require("./Util");
const {safeGetCell} = require("./Environment");

const cartesianProduct = items =>
    items.flatMap(outerIndex => items.flatMap(innerIndex => [{xChange: innerIndex, yChange: outerIndex}]));

const visionRange = cartesianProduct(Util.trueRange(2, -2));
const movementRange = cartesianProduct(Util.trueRange(1, -1));

export default class BehaviourController {
    processTimeStep(environment, timeStep) {
        console.log('timeStep:' + timeStep)
        environment = this.processAgentBehaviour(environment, timeStep);

        return environment;
    }

    processAgentBehaviour(environment, timeStep) {
        const agentCells = environment.getCellsOfType(CELL_TYPES.Agent);

        if (agentCells.length === 0) {
            environment.end = true;
            return environment;
        }

        const agentMovements = this.generateAgentMovements(agentCells, environment.cells);

        environment.cells = this.simulateAgentMovements(agentMovements, environment.cells, timeStep);

        return environment;
    }

    simulateAgentMovements(agentMovements, cells, timeStep) {
        const clonedCells = _.cloneDeep(cells);
        agentMovements.forEach(agentMovement => {
            const currentAgentCell = clonedCells[agentMovement.agentCell.y][agentMovement.agentCell.x];
            currentAgentCell.updateToPreviousCell(timeStep);
            let newAgentCell = clonedCells[agentMovement.agentCell.y + agentMovement.movement.yChange][agentMovement.agentCell.x + agentMovement.movement.xChange];
            newAgentCell.updateToAgent(agentMovement.agentCell.agent);
        });

        return clonedCells;
    }

    generateAgentMovements(agentCells, cells) {
        agentCells.forEach(agentCell => {
            agentCell.agent.hunger += 0.1
            console.log('Monkey name=' + agentCell.agent.name + " hunger=" + agentCell.agent.hunger, agentCell.x, agentCell.y, agentCell.agent.hunger);
            if (agentCell.agent.hunger > 1) agentCell.type = CELL_TYPES.Dead
        });

        return agentCells.filter(agentCell => !agentCell.agent.isDead()).map(agentCell => {
            return {
                agentCell,
                movement: this.searchForFood(agentCell, cells)
            }
        });
    }

    searchForFood(agent, cells) {
        const cellsInSenseRange = this.generateCellsInSightRange(agent, cells);
        const foodCellsInRange = cellsInSenseRange.filter(cell => cell.type.isEdible);

        if (foodCellsInRange.length > 0) {
            return this.navigateTowards(agent, cells, foodCellsInRange.random());
        }

        return this.navigateTowards(agent, cells, this.generateCellsInMovementRange(agent, cells).random());
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

    navigateTowards(agent, cells, targetCell) {
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
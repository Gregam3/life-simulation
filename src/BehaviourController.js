import {TILES} from "./Agent";

const Util = require("./Util");
const {safeGetCell} = require("./Environment");

const cartesianProduct = items =>
    items.flatMap(outerIndex => items.flatMap(innerIndex => [{xChange: innerIndex, yChange: outerIndex}]));

const visionRange = cartesianProduct(Util.trueRange(2, -2));
const movementRange = cartesianProduct(Util.trueRange(1, -1));

export default class BehaviourController {
    act(agentCells, cells) {
        agentCells.forEach(agentCell => {
            agentCell.agent.hunger -= 0.1
            if (agentCell.agent.hunger < 0) agentCell.type = TILES.Dead
        });


        const agentMovements = agentCells.filter(agentCell => agentCell.agent.hunger > 0).map(agentCell => {
            return {
                agent: agentCell,
                movement: this.searchForFood(agentCell, cells)
            }
        });

        agentMovements.forEach(agentMovement => {
            console.log('agentMovement', agentMovement)
            cells[agentMovement.agent.y][agentMovement.agent.x].type = TILES.Grass;
            cells[agentMovement.agent.y + agentMovement.movement.yChange][agentMovement.agent.x + agentMovement.movement.xChange].type = TILES.Agent;
        });

        return cells;
    }


    searchForFood(agent, cells) {
        const cellsInSenseRange = this.generateCellsInSightRange(agent, cells, 2);

        const foodCellsInRange = cellsInSenseRange.filter(cell => cell.type.isEdible);

        console.log('food', foodCellsInRange)

        if (foodCellsInRange.length > 0) {
            return this.navigateTowards(agent, cells, foodCellsInRange.random());
        }

        return this.navigateTowards(agent, cells, this.generateCellsInMovementRange(agent, cells).random());

    }

    generateCellsInSightRange = (agent, cells, sightLength) => {
        return visionRange.flatMap(positionChange => safeGetCell(
                    cells,
                    agent.x + positionChange.xChange,
                    agent.y + positionChange.yChange
                )
            ).filter(cell => cell !== null);
    }

    generateCellsInMovementRange = (agent, cells, sightLength) => {
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
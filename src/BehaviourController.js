import {TILES} from "./Agent";

const Util = require("./Util");
const {safeGetCell} = require("./Environment");

const cartesianProduct = items =>
    items.flatMap(outerIndex => items.flatMap(innerIndex => [{xChange: innerIndex, yChange: outerIndex}]));

export default class BehaviourController {
    act(agents, cells) {
        const agentMovements = agents.map(agent => {
            return {
                agent,
                movement: this.searchForFood(agent, cells)
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

        return {
            xChange: 0, yChange: 0
        }
    }

    generateCellsInSightRange = (agent, cells, sightLength) => {
        const product = cartesianProduct(Util.trueRange(sightLength, sightLength * -1));
        console.log('product', product, 'agent', agent);

        return product.flatMap(positionChange => safeGetCell(
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
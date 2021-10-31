const Util = require("./Util");
const {safeUpdateCells, safeGetCell} = require("./Environment");

const cartesianProduct = items =>
    items.map(outerIndex => items.map(innerIndex => [{xChange: innerIndex, yChange: outerIndex}]));

class BehaviourController {
    searchForFood(agent, cells) {
        const cellsInSenseRange = this.generateCellsInSightRange(agent, cells, 2);

        cellsInSenseRange.filter(cell => cell.isEdible())
    }

    generateCellsInSightRange = (agent, cells, sightLength) => cartesianProduct(Util.range(sightLength, sightLength * -1))
        .map(positionChange => safeGetCell(
                cells,
                agent.x + positionChange.xChange,
                agent.y + positionChange.yChange
            )
        );

}
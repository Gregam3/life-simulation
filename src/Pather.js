const PF = require('pathfinding');

export default class Pather {
    generatePath(agentCell, targetCell, environment) {
        const grid = new PF.Grid(environment.width, environment.height);

        let x = 0;
        let y = 0;

        environment.cells.forEach(row => {
            x = 0;
            row.forEach(cell => {
                grid.setWalkableAt(x, y, !cell.type.obstructs);
                x++;
            });
            y++;
        });

        const pathFinder = new PF.AStarFinder();

        if (agentCell === undefined || targetCell === undefined) {
            return [];
        }

        let agentPath = pathFinder.findPath(agentCell.x, agentCell.y, targetCell.x, targetCell.y, grid);
        //This refers to the current agent's position
        agentPath.splice(0, 1);
        return agentPath;
    }
}
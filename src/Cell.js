import {CELL_TYPES} from "./Agent";

export default class Cell {
    constructor(type, y, x, agent = null) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.agent = agent;
        this.cellHistory = [];
        if (this.type.name !== 'Agent') {
            this.addItemToCellHistory();
        }
    }

    updateType(newType) {
        this.type = newType;
        this.addItemToCellHistory(newType);
    }

    addItemToCellHistory(newType) {
        this.cellHistory.unshift({type: newType ? newType : this.type, agent: this.agent});
    }

    updateToAgent(agent) {
        if (this.type.calories > 0) {
            this.addItemToCellHistory(CELL_TYPES.Grass);
            agent.hunger -= this.type.calories;
        }

        this.agent = agent;
        this.type = CELL_TYPES.Agent;
        // this.agent.currentPath.splice(0, 1);
    }

    updateToPreviousCell(timeStep) {
        if (timeStep === 1 && this.type.isAgent) {
            this.type = CELL_TYPES.Grass;
            this.agent = null;
        } else if (this.cellHistory.length > 0) {
            this.type = this.cellHistory[0].type;
        }
    }
}
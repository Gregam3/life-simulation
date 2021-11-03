import {CELL_TYPES} from "./Agent";

export default class Cell {
    constructor(type, y, x, agent = null) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.agent = agent;
        this.cellHistory = [];
    }

    addItemToCellHistory(newType) {
        this.cellHistory.unshift({type: newType ? newType : this.type, agent: this.agent});
    }

    updateToAgent(agent) {
        if (this.type.isEdible) {
            this.addItemToCellHistory(CELL_TYPES.Grass);
            agent.hunger -= 0.5;
        }

        this.cellHistory.unshift({type: CELL_TYPES.Grass, agent: this.agent});
        this.agent = agent;
        this.type = CELL_TYPES.Agent;
    }

    updateToPreviousCell() {
        if (this.cellHistory.length > 0 && this.type.isAgent) this.type = this.cellHistory[0].type;
    }
}
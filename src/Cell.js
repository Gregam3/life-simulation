import {CELL_TYPES} from "./Agent";

export default class Cell {
    constructor(type, y, x, agent = null) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.agent = agent;
        this.cellHistory = [];
    }

    addItemToCellHistory(newType = null) {
        this.cellHistory.unshift({type: newType == null ? this.type : newType, agent: this.agent});
    }

    updateToAgent(agent) {
        this.addItemToCellHistory(this.type === CELL_TYPES.Fruit ? CELL_TYPES.Grass : null);
        this.agent = agent;
        this.type = CELL_TYPES.Agent;
        console.log(this.type);
    }

    updateToPreviousCell() {
        if (this.cellHistory.length > 0) this.type = this.cellHistory[0].type;
        else this.type = CELL_TYPES.Grass;
        console.log(this.type);
    }
}
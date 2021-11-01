import {TILES} from "./Agent";

export default class Cell {
    constructor(type, y, x, agent = null) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.agent = agent;
        this.cellHistory = [];
    }

    addItemToCellHistory() {
        this.cellHistory.unshift({type: this.type, agent: this.agent});
    }

    updateToAgent(agent) {
        this.addItemToCellHistory();
        this.agent = agent;
        this.type = TILES.Agent;
        console.log(this.type);
    }

    updateToPreviousCell() {
        if (this.cellHistory.length > 0) this.type = this.cellHistory[0].type;
        else this.type = TILES.Grass;
        console.log(this.type);
    }
}
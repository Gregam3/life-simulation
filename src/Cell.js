export default class Cell {
    constructor(type, y, x, agent = null) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.agent = agent;
    }

    previousCell = null;
}
import logo from './logo.svg';
import './App.css';
import React from "react";
import Environment from "./Environment";
import BehaviourController from "./BehaviourController";
import {TILES} from "./Agent";

const range = (i) => {
    return [...Array(i).keys()];
}

const cells = new Environment(25, 10).generateEnvironment();
const behaviourController = new BehaviourController();

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timeStep: 1, cells
        }
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 2000);
    }

    tick() {
        const agents = this.state.cells.flatMap(rows => rows.filter(cell => cell.type === TILES.Agent));

        this.setState({
            timeStep: this.state.timeStep + 1,
            cells: behaviourController.act(agents, this.state.cells)
        });
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1>Life Simulation</h1>
                    Time step: {this.state.timeStep}
                    {this.renderCells(this.state.cells)}
                </header>
            </div>
        );
    }

    renderCells(cells) {
        return range(cells.length).map(x => <div>{range(cells[0].length).map(y => this.renderCell(cells[x][y]))}</div>);
    }

    renderCell(tile) {
        return <span style={{
            color: tile.type.color,
            width: '25px',
            display: 'inline-block'
        }}>{tile.type.characters.random()}</span>;
    }
}

export default App;

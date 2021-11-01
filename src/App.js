import logo from './logo.svg';
import './App.css';
import React from "react";
import Environment from "./Environment";
import BehaviourController from "./BehaviourController";
import {CELL_TYPES} from "./Agent";

const range = (i) => {
    return [...Array(i).keys()];
}

const environment = new Environment(50, 10);
const BEHAVIOUR_CONTROLLER = new BehaviourController();

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timeStep: 1, environment
        }
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 2000);
    }

    tick() {
        this.setState({
            timeStep: this.state.timeStep + 1,
            cells: BEHAVIOUR_CONTROLLER.processTimeStep(this.state.environment)
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
                    {this.renderCells(this.state.environment.cells)}
                </header>
            </div>
        );
    }

    renderCells(cells) {
        return range(cells.length).map(x => <div>{range(cells[0].length).map(y => this.renderCell(cells[x][y]))}</div>);
    }

    renderCell(tile) {
        if (tile) console.log('tile', tile)

        return <span style={{
            color: tile.type.color,
            width: '25px',
            display: 'inline-block'
        }}>{tile.type.characters.random()}</span>;
    }
}

export default App;

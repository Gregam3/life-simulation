import logo from './logo.svg';
import './App.css';
import React from "react";
import Environment from "./Environment";

const range = (i) => {
    return [...Array(i).keys()];
}

const environment = new Environment(50, 10);
const cells = environment.generateEnvironment();

class App extends React.Component {
    constructor(props) {
        super(props);
        this.environment = new Environment(50, 10);
        this.state = {
            timeStep: 1, cells
        }
    }

    componentDidMount() {
        this.interval = setInterval(() => this.setState({ timeStep: this.state.timeStep + 1 }), 1000);
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
                    {this.renderCells(cells)}
                </header>
            </div>
        );
    }

    renderCells(cells) {
        return range(cells.length).map(x => <div>{range(cells[0].length).map(y => this.renderCell(cells[x][y]))}</div>);
    }

    renderCell(tile) {
        return <span style={{color: tile.type.color, width: '25px', display: 'inline-block'}}>{tile.type.characters.random()}</span>;
    }
}

export default App;

import './App.css';
import React from "react";
import Environment from "./Environment";
import BehaviourController from "./BehaviourController";
import 'react-rangeslider/lib/index.css'
import _ from "lodash";
import Mutator from "./Mutator";

const range = (i) => {
    return [...Array(i).keys()];
}

let environmentArchive = {};

const mutator = new Mutator();

const results = [];

function generateNewEnvironment() {
    return new Environment(10, 20,
        {
            waterBodies: 15,
            treeChance1InX: 10,
            agentChance1InX: 50,
            minimumAgents: 2,
            agentMutations: mutator.generateRandomPointSpread()
        });
}

const environment = generateNewEnvironment();
const BEHAVIOUR_CONTROLLER = new BehaviourController();
const numericStringSortCollator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});

const sleep = ms => new Promise(r => setTimeout(r, ms));

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timeStep: 1,
            currentEnvironment: environment,
            timeScale: 100
        }
    }

    componentDidMount() {
        this.tick();
    }

    environmentIterations = 0;

    tick() {
        if (this.state.paused) {
            console.log("Paused")
        } else {
            if (this.state.currentEnvironment.end) {
                console.log('All Monkeys are dead :(');
                results.push({
                    agentMutations: this.state.currentEnvironment.generationOptions.agentMutations,
                    timeStepReached: this.state.timeStep
                });

                this.setState({
                    timeStep: 1,
                    currentEnvironment: generateNewEnvironment()
                });
                this.environmentIterations++;

                if (this.environmentIterations > 50) {
                    const orderedResults = results.sort((a, b) => a.timeStepReached - b.timeStepReached).reverse();
                    console.log();
                }
            } else {
                this.maxTimeStep = Object.keys(environmentArchive).sort(numericStringSortCollator.compare).reverse()[0];
                this.minTimeStep = Object.keys(environmentArchive).sort(numericStringSortCollator.compare)[0];
                this.setState({
                    timeStep: this.state.timeStep + 1,
                    cells: BEHAVIOUR_CONTROLLER.processTimeStep(this.state.currentEnvironment, this.state.timeStep)
                });
                environmentArchive[this.state.timeStep] = _.cloneDeep(this.state.currentEnvironment);
                if (environmentArchive[this.state.timeStep - 10]) {
                    delete environmentArchive[this.state.timeStep - 10];
                }
            }
        }

        sleep(10 * this.state.timeScale).then(() => this.tick());
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    maxTimeStep = 0;
    minTimeStep = 0;

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1>Emergence</h1>
                    <span>
                        {this.state.timeStep > this.minTimeStep &&
                        <button type="button" onClick={() => this.changeTimeStep(-1)}>⬅</button>}
                        Time step: {this.state.timeStep}
                        {this.state.timeStep < this.maxTimeStep &&
                        <button type="button" onClick={() => this.changeTimeStep(1)}>➡</button>}
                    </span>
                    <button type="button" onClick={() => this.setState({paused: !this.state.paused})}>
                        {this.state.paused ? "⏯" : "⏸"}
                    </button>

                    <span>
                        Debug agent name: {this.state.currentEnvironment.debugAgentName}
                        <button type="button" onClick={() => {
                            let newEnvironment = this.state.currentEnvironment;
                            newEnvironment.debugAgentName = "";
                            this.setState({currentEnvironment: newEnvironment});
                        }}>Clear debug</button>
                    </span>
                    <input type="range" min={2} max={1000} value={this.state.timeScale}
                           onChange={event => this.setState({timeScale: event.target.value})}/>
                    {this.renderCells(this.state.currentEnvironment.cells)}
                </header>
            </div>
        );
    }

    changeTimeStep(timeStepChange) {
        let newTimeStep = this.state.timeStep + timeStepChange;
        this.setState({
            timeStep: newTimeStep,
            currentEnvironment: environmentArchive[newTimeStep]
        })
    }

    renderCells(cells) {
        return range(cells.length).map(x => <div>{range(cells[0].length).map(y => this.renderCell(cells[x][y]))}</div>);
    }

    renderCell(cell) {
        return <span style={{
            backgroundColor: cell.type.color,
            width: '25px',
            height: '25px',
            display: 'inline-block'
        }}
                     onClick={() => {
                         if (cell.agent) {
                             const newEnvironment = this.state.currentEnvironment;
                             newEnvironment.debugAgentName = cell.agent.name;
                             this.setState({currentEnvironment: newEnvironment});
                         }
                     }}>{cell.type.character}</span>;
    }
}

export default App;

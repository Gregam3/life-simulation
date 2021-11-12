import './App.css';
import React from "react";
import Environment from "./Environment";
import BehaviourController from "./BehaviourController";
import 'react-rangeslider/lib/index.css'
import _ from "lodash";
import Mutator, {POINT_CATEGORIES} from "./Mutator";
import ReactApexChart from "react-apexcharts";

const range = (i) => {
    return [...Array(i).keys()];
}

const options = {
    height: 350,
    type: 'scatter',
    animations: {
        duration: 0
    },
    theme: {mode: 'dark'},
    animation: {
        duration: 0
    },
    title: {
        text: 'Point allocation vs lifetime',
        align: 'left'
    },
    yaxis: {
        labels: {
            formatter: val => Math.floor(val)
        },
        grid: {
            padding: {
                left: 0,
                right: 0
            }
        }
    },
    xaxis: {
        grid: {
            padding: {
                left: 0,
                right: 0
            }
        }
    },
    grid: {
        padding: {
            left: 0,
            right: 0
        }
    },
    colors: ['#FF0000', '#00FF00', '#0000FF']
}

function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach(item => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

let environmentArchive = {};

const mutator = new Mutator();

const mutationResults = [];

const WIDTH = 10;
const HEIGHT = 10;


function generateNewEnvironment() {
    return new Environment(WIDTH, HEIGHT,
        {
            waterBodies: Math.round(WIDTH / 1.5),
            treeChance1InX: 10,
            agentChance1InX: 50,
            agentSpawnCount: 4,
            agentMutations: mutator.generateRandomPointSpread()
        });
}

const calculateAveragePerValue = (items, keyGetter) => {
    let total = 0;

    items.forEach(i => total += keyGetter(i));

    return total / items.length;
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
            timeScale: 100,
            shouldRender: true
        }
    }

    componentDidMount() {
        this.tick();
    }

    environmentIterations = 0;
    orderedResults = [];

    tick() {
        if (this.state.paused) {
            console.log("Paused")
        } else {
            if (this.state.currentEnvironment.end) {
                console.log('All Monkeys are dead :(');
                mutationResults.push({
                    agentMutations: this.state.currentEnvironment.generationOptions.agentMutations,
                    timeStepReached: this.state.timeStep
                });

                this.charts = this.renderNewChart();
                this.setState({
                    timeStep: 1,
                    currentEnvironment: generateNewEnvironment()
                });
                this.environmentIterations++;

                if (this.environmentIterations > 100) {
                    this.orderedResults = mutationResults.sort((a, b) => a.timeStepReached - b.timeStepReached).reverse();
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

        let sleepTimeInMs = 10 * this.state.timeScale;

        if (!this.state.shouldRender) {
            sleepTimeInMs = 0;
        }

        sleep(sleepTimeInMs).then(() => this.tick());
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    maxTimeStep = 0;
    minTimeStep = 0;

    render() {
        if (this.state.shouldRender) {

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
                        <input type="range" min={5} max={1000} value={this.state.timeScale}
                               onChange={event => this.setState({timeScale: event.target.value})}/>
                        {this.renderCells(this.state.currentEnvironment.cells)}
                        <p>Environment Iteration count: {this.environmentIterations}</p>
                        <button type="button" onClick={() => this.setState({shouldRender: false})}>Disable rendering</button>
                        {this.getChartRenders()}
                    </header>
                </div>
            );
        } else {
            return <div className="App">
                <header className="App-header">
                    <h1>Emergence</h1>
                    <button type="button" onClick={() => this.setState({shouldRender: true})}>Enable rendering</button>
                    <p>Environment Iteration count: {this.environmentIterations}</p>
                    {this.getChartRenders()}
                </header>
            </div>
        }
    }

    charts = null;

    getChartRenders() {
        if (this.charts === null) {
            this.charts = this.renderNewChart();
        }

        return this.charts;
    }

    renderNewChart() {
        return <ReactApexChart options={options} series={this.getMutatorChartSeries()}
                               type="scatter" height={300} width={400}/>;
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

    getMutatorChartSeries() {
        const series = [];


        mutator.POINT_CATEGORY_KEYS.forEach(key => {
            const seriesItem = {
                name: key,
                data: []
            };

            const itemsGrouped = groupBy(mutationResults, result => result.agentMutations.pointDistribution[key]);
            const itemsGroupedMean = Array.from(itemsGrouped)
                .map(([key, value]) => ({key, value: calculateAveragePerValue(value, v => v.timeStepReached)}));

            itemsGroupedMean.forEach(entry => {
                seriesItem.data.push([
                    entry.key,
                    entry.value
                ]);
            });

            series.push(seriesItem);
        });

        return series;
    }
}


export default App;

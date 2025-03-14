class DAFSA {
    constructor() {
        this.states = { 0: {} }; // Start state
        this.stateCount = 0;
        // Predefined language L
        this.language = new Set(["aa", "aab", "aaab", "aba", "abab", "ba", "baab", "bab", "bba", "bbab"]);
    }

    // Add a string to the DAFSA
    addString(string) {
        if (!this.language.has(string)) {
            console.error(`"${string}" is not part of the predefined language L.`);
            showMessage(`"${string}" is not part of the predefined language L.`);
            return; // Reject the string
        }

        let currentState = 0;
        for (const char of string) {
            if (!this.states[currentState][char]) {
                this.stateCount++;
                this.states[currentState][char] = this.stateCount;
                this.states[this.stateCount] = {};
            }
            currentState = this.states[currentState][char];
        }
        this.states[currentState].final = true; // Mark as final state
        showMessage(`"${string}" added to the DAFSA.`);
    }

    // Search if a string exists in the DAFSA
    searchString(string) {
        let currentState = 0;
        for (const char of string) {
            if (!this.states[currentState][char]) {
                showMessage(`"${string}" is NOT in the DAFSA.`);
                return false;
            }
            currentState = this.states[currentState][char];
        }
        const found = this.states[currentState].final || false;
        showMessage(`"${string}" is ${found ? "" : "NOT "}in the DAFSA.`);
        return found;
    }

    // Minimize the DAFSA
    minimize() {
        const heightMap = this.calculateHeights();
        const equivalentGroups = new Map();

        const heights = Object.keys(heightMap).map(Number).sort((a, b) => b - a);
        for (const height of heights) {
            const statesAtHeight = heightMap[height];
            for (const state of statesAtHeight) {
                const stateKey = this.generateStateKey(state);
                if (!equivalentGroups.has(stateKey)) {
                    equivalentGroups.set(stateKey, state);
                } else {
                    this.mergeStates(state, equivalentGroups.get(stateKey));
                }
            }
        }
        showMessage("DAFSA minimized successfully.");
    }

    // Calculate the height of each state (depth-first search)
    calculateHeights() {
        const heights = {};
        const visited = new Set();

        const dfs = (state) => {
            if (visited.has(state)) return 0;
            visited.add(state);
            let maxHeight = 0;
            for (const [char, nextState] of Object.entries(this.states[state])) {
                if (char !== "final") {
                    maxHeight = Math.max(maxHeight, 1 + dfs(nextState));
                }
            }
            if (!heights[maxHeight]) heights[maxHeight] = [];
            heights[maxHeight].push(state);
            return maxHeight;
        };

        dfs(0);
        return heights;
    }

    generateStateKey(state) {
        const transitions = this.states[state];
        const entries = Object.entries(transitions)
            .filter(([key]) => key !== "final")
            .map(([char, nextState]) => `${char}->${nextState}`)
            .sort(); // Sort to ensure unique keys regardless of order
        const isFinal = transitions.final ? "F" : "NF";
        return JSON.stringify(entries) + isFinal;
    }

    mergeStates(fromState, toState) {
        // Update all references to fromState
        for (const [state, transitions] of Object.entries(this.states)) {
            for (const [char, nextState] of Object.entries(transitions)) {
                if (nextState === fromState) {
                    this.states[state][char] = toState;
                }
            }
        }

        // Merge transitions of fromState into toState
        for (const [char, nextState] of Object.entries(this.states[fromState])) {
            if (char !== "final") {
                // Add transition if it doesn't already exist
                if (!this.states[toState][char]) {
                    this.states[toState][char] = nextState;
                }
            }
        }

        // Handle final state
        if (this.states[fromState].final) {
            this.states[toState].final = true;
        }

        // Delete the fromState
        delete this.states[fromState];
    }

    // Get nodes and edges for graph visualization
    getNodesAndEdges() {
        const nodes = [];
        const edges = [];

        for (const [state, transitions] of Object.entries(this.states)) {
            const nodeId = Number(state);
            const nodeLabel = `(-1, ${nodeId})`;
            nodes.push({
                id: nodeId,
                label: nodeLabel,
                shape: transitions.final ? 'circle' : 'ellipse',
                color: transitions.final ? '#89CFF0' : '#E0FFFF',
                font: {
                    size: 16,
                    bold: transitions.final
                }
            });

            // Add edges, supporting multiple labels
            const transitionMap = {};
            for (const [char, nextState] of Object.entries(transitions)) {
                if (char !== "final") {
                    if (!transitionMap[nextState]) {
                        transitionMap[nextState] = [];
                    }
                    transitionMap[nextState].push(char);
                }
            }

            for (const [nextState, chars] of Object.entries(transitionMap)) {
                edges.push({
                    from: nodeId,
                    to: Number(nextState),
                    label: chars.join(", ") // Display multiple transitions as "a, b"
                });
            }
        }

        return { nodes, edges };
    }
}

const dafsa = new DAFSA();

// Functions to handle UI interactions
function addString() {
    const input = document.getElementById("inputString").value.trim();
    if (input) {
        dafsa.addString(input); // Will validate internally
    } else {
        showMessage("Please enter a valid string.");
    }
}

function searchString() {
    const input = document.getElementById("inputString").value.trim();
    if (input) {
        let currentState = 0;
        const path = [currentState]; // To store the path of states visited

        for (const char of input) {
            if (!dafsa.states[currentState][char]) {
                showMessage(`"${input}" is NOT in the DAFSA.`);
                updateGraph(path); // Highlight the visited part of the graph
                return;
            }
            currentState = dafsa.states[currentState][char];
            path.push(currentState);
        }

        const found = dafsa.states[currentState].final || false;
        showMessage(`"${input}" is ${found ? "" : "NOT "}in the DAFSA.`);
        updateGraph(found ? path : []); // Highlight path if found, or clear highlights
    } else {
        showMessage("Please enter a valid string.");
    }
}        

function minimizeDAFSA() {
    dafsa.minimize();
    updateGraph();
}

// Graph update Function
function updateGraph(highlightPath = []) {
    const { nodes, edges } = dafsa.getNodesAndEdges();
    const container = document.getElementById("network");

    // Update node colors based on the highlight path
    const updatedNodes = nodes.map(node => ({
        ...node,
        color: highlightPath.includes(node.id) ? 'rgba(255, 0, 0, 0.6)' : node.color,
        font: { color: highlightPath.includes(node.id) ? 'white' : node.font.color, bold: highlightPath.includes(node.id) },
    }));

    // Update edge colors based on the highlight path
    const updatedEdges = edges.map(edge => ({
        ...edge,
        color: highlightPath.includes(edge.from) && highlightPath.includes(edge.to) ? { color: 'red' } : edge.color,
    }));

    const data = {
        nodes: new vis.DataSet(updatedNodes),
        edges: new vis.DataSet(updatedEdges),
    };

    const options = {
        nodes: {
            shape: 'ellipse',
            font: { size: 16 },
        },
        edges: {
            arrows: { to: true },
            font: { size: 14 },
        },
        layout: {
            hierarchical: { direction: 'UD', sortMethod: 'directed' },
        },
        physics: { enabled: false },
    };

    new vis.Network(container, data, options);
}

function clearGraph() {
    // Reset the DAFSA states
    dafsa.states = { 0: {} }; // Reset to the initial state
    dafsa.stateCount = 0;

    // Clear the graph visualization
    const container = document.getElementById("network");
    const data = { nodes: new vis.DataSet([]), edges: new vis.DataSet([]) };

    const options = {
        nodes: {
            shape: "ellipse",
            font: { size: 16 }
        },
        edges: {
            arrows: { to: true },
            font: { size: 14 }
        },
        layout: {
            hierarchical: { direction: "UD", sortMethod: "directed" }
        },
        physics: { enabled: false }
    };

    new vis.Network(container, data, options);
    showMessage("Graph cleared and DAFSA reset.");
}

function showMessage(message) {
    document.getElementById("output").textContent = message;
    console.log(message); // Log for debugging
}
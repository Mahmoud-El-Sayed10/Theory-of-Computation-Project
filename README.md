# DAFSA Visualization Tool

## Overview
This project implements a Deterministic Acyclic Finite State Automaton (DAFSA) visualization tool. It allows users to build, search, and minimize a DAFSA structure through an interactive web interface. The implementation demonstrates key concepts in automata theory and provides a visual way to understand how DAFSAs operate.

## Features

- **Add strings** to the DAFSA from a predefined language
- **Search for strings** in the DAFSA with visual path highlighting
- **Minimize the DAFSA** to reduce redundant states 
- **Visualize the automaton** as an interactive graph
- **Clear and reset** the DAFSA structure

## Predefined Language

The system works with the following predefined language L:
```
L = {"aa", "aab", "aaab", "aba", "abab", "ba", "baab", "bab", "bba", "bbab"}
```

Only strings from this language can be added to the DAFSA.

## Technical Implementation

### DAFSA Class
The core of the project is the `DAFSA` class which implements:
- State management with a dictionary structure
- String addition and searching algorithms
- State minimization using equivalence classes
- Graph data generation for visualization

### Visualization
The project uses the vis.js library to render the DAFSA as an interactive network graph:
- States are represented as nodes (circles for final states, ellipses for non-final states)
- Transitions are represented as directed edges with character labels
- Search paths are highlighted in red when searching for strings

## How to Use

1. **Enter a string** in the input field (must be from the predefined language)
2. Use the **Add String** button to insert it into the DAFSA
3. Use the **Search String** button to find strings in the DAFSA (will highlight the path if found)
4. Click **Minimize DAFSA** to optimize the automaton structure
5. Use **Show DAFSA Graph** to visualize the current state
6. Click **Clear Graph** to reset everything

## File Structure

- `index.html` - Main HTML structure with UI elements
- `script.js` - JavaScript implementation of the DAFSA class and UI functions
- `styles.css` - CSS styling for the interface

## Theory Background

### What is a DAFSA?
A Deterministic Acyclic Finite State Automaton (DAFSA), also known as a directed acyclic word graph (DAWG), is a data structure that:
- Represents a set of strings
- Is deterministic (one transition per character per state)
- Is acyclic (contains no cycles)
- Efficiently stores strings with common prefixes

### Minimization Process
The minimization algorithm identifies and merges equivalent states to create a minimal DAFSA:
1. States are grouped by their "height" (maximum distance to a leaf node)
2. States with identical transition patterns are merged
3. References to merged states are updated throughout the automaton

## Educational Value

This tool is useful for:
- Visualizing automata theory concepts
- Understanding finite state machines
- Demonstrating state minimization algorithms
- Exploring string recognition in formal languages

## Future Enhancements

Possible improvements could include:
- Support for user-defined languages
- Step-by-step visualization of the minimization process
- Additional automata operations (union, intersection, etc.)
- Export/import functionality for saved automata

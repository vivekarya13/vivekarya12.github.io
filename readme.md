# OS Scheduling Visualizer

## About the Project
The OS Scheduling Visualizer is an interactive web application that demonstrates various CPU scheduling algorithms used in operating systems. It provides a visual representation of how different scheduling algorithms handle process execution, making it easier to understand their behavior and performance characteristics.

### Key Features
- Interactive 3D Gantt charts
- Support for multiple scheduling algorithms
- Real-time calculation of performance metrics
- Dynamic process input
- Comparative analysis of different algorithms
- Interactive visualization with rotation and zoom capabilities

## Tech Stack
1. **Frontend Technologies**
   - HTML5
   - JavaScript (ES6+)
   - Three.js for 3D visualization

2. **Development Tools**
   - Visual Studio Code (recommended editor)
   - Git for version control
   - Node.js (optional, for local development server)

## Project Structure:
```
os-scheduler-visualizer/
│
├── index.html          # Main HTML file
├── readme.md           # Readme file
├── img                 # Icons
└── js/
    └── script.js       # JavaScript code
```

## Data Structures and Algorithms

### Data Structures Used
1. **Arrays and Objects**
   - Process queue management
   - Timeline tracking
   - Result storage

2. **Priority Queues**
   - Implementation of SJF and SRTF algorithms
   - Process scheduling based on burst time

### Algorithms Implemented

1. **First Come First Serve (FCFS)**
   - Non-preemptive scheduling
   - Processes executed in arrival order
   - Time Complexity: O(n log n)

2. **Shortest Job First (SJF)**
   - Non-preemptive scheduling
   - Processes executed based on burst time
   - Time Complexity: O(n log n)

3. **Shortest Remaining Time First (SRTF)**
   - Preemptive version of SJF
   - Continuous monitoring of remaining time
   - Time Complexity: O(n log n)

4. **Round Robin (RR)**
   - Time quantum based scheduling
   - Fair CPU distribution
   - Time Complexity: O(n * total_time/quantum)

## How to Run the Project

### Local Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/os-scheduling-visualizer.git
   cd os-scheduling-visualizer
   ```

2. **Using Python's Built-in Server**
   ```bash
   # If you have Python 3 installed
   python -m http.server 8000

   # If you have Python 2 installed
   python -m SimpleHTTPServer 8000
   ```
   Then open http://localhost:8000 in your browser

3. **Using Node.js**
   ```bash
   # Install http-server globally
   npm install -g http-server

   # Run the server
   http-server
   ```
   Then open http://localhost:8080 in your browser

4. **Using VS Code**
   - Install "Live Server" extension
   - Right-click on index.html
   - Select "Open with Live Server"
   - Browser will open automatically

### Accessing the Deployed Version
1. Visit [https://os-scheduling-visualizer.herokuapp.com](https://os-scheduling-visualizer.herokuapp.com)
2. No installation required
3. Works on all modern browsers

### Usage Instructions
1. Select a scheduling algorithm from the dropdown
2. Enter the number of processes
3. Input arrival time and burst time for each process
4. For Round Robin, specify the time quantum
5. Click "Run Selected" to visualize one algorithm
6. Click "Run All" to compare all algorithms
7. Use mouse to rotate and zoom the Gantt charts

## Contributing
Feel free to fork this repository and submit pull requests. You can also open issues for bugs or feature suggestions.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
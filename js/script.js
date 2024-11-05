
        // Color palette for jobs
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
            '#D4A5A5', '#9B8EA9', '#58B19F', '#FFB6B9', '#67E0A3'
        ];

        function generateJobInputs() {
            const jobCount = parseInt(document.getElementById('jobCount').value);
            const jobInputs = document.getElementById('jobInputs');
            jobInputs.innerHTML = '';

            for (let i = 0; i < jobCount; i++) {
                const jobDiv = document.createElement('div');
                jobDiv.className = 'grid grid-cols-3 gap-4';
                jobDiv.innerHTML = `
                    <div>
                        <label class="block mb-2">Job ${i + 1}</label>
                        <input type="text" value="P${i + 1}" class="w-full p-2 border rounded-md" readonly>
                    </div>
                    <div>
                        <label class="block mb-2">Arrival Time</label>
                        <input type="number" min="0" value="${i}" class="arrival-time w-full p-2 border rounded-md">
                    </div>
                    <div>
                        <label class="block mb-2">Burst Time</label>
                        <input type="number" min="1" value="${Math.floor(Math.random() * 10) + 1}" class="burst-time w-full p-2 border rounded-md">
                    </div>
                `;
                jobInputs.appendChild(jobDiv);
            }
        }

        // Show/hide time quantum input based on algorithm selection
        document.getElementById('algorithm').addEventListener('change', function() {
            const timeQuantumDiv = document.getElementById('timeQuantumDiv');
            timeQuantumDiv.classList.toggle('hidden', this.value !== 'rr');
        });

        // Scheduling algorithms implementation
        function FCFS(jobs) {
            let currentTime = 0;
            const result = [];
            const sortedJobs = [...jobs].sort((a, b) => a.arrivalTime - b.arrivalTime);

            for (const job of sortedJobs) {
                currentTime = Math.max(currentTime, job.arrivalTime);
                const completionTime = currentTime + job.burstTime;
                const turnaroundTime = completionTime - job.arrivalTime;
                const waitingTime = turnaroundTime - job.burstTime;

                result.push({
                    ...job,
                    completionTime,
                    turnaroundTime,
                    waitingTime,
                    timeline: [{
                        start: currentTime,
                        end: completionTime
                    }]
                });

                currentTime = completionTime;
            }

            return result;
        }

        function SJF(jobs) {
            let currentTime = 0;
            const result = [];
            const remainingJobs = [...jobs];
            
            while (remainingJobs.length > 0) {
                const availableJobs = remainingJobs.filter(job => job.arrivalTime <= currentTime);
                
                if (availableJobs.length === 0) {
                    currentTime = Math.min(...remainingJobs.map(job => job.arrivalTime));
                    continue;
                }

                const shortestJob = availableJobs.reduce((prev, curr) => 
                    prev.burstTime < curr.burstTime ? prev : curr
                );

                const completionTime = currentTime + shortestJob.burstTime;
                const turnaroundTime = completionTime - shortestJob.arrivalTime;
                const waitingTime = turnaroundTime - shortestJob.burstTime;

                result.push({
                    ...shortestJob,
                    completionTime,
                    turnaroundTime,
                    waitingTime,
                    timeline: [{
                        start: currentTime,
                        end: completionTime
                    }]
                });

                currentTime = completionTime;
                const index = remainingJobs.findIndex(job => job.id === shortestJob.id);
                remainingJobs.splice(index, 1);
            }

            return result;
        }

        function SRTF(jobs) {
            let currentTime = 0;
            const result = [];
            const remainingJobs = jobs.map(job => ({...job, remainingTime: job.burstTime, timeline: []}));
            
            while (remainingJobs.some(job => job.remainingTime > 0)) {
                const availableJobs = remainingJobs.filter(job => 
                    job.arrivalTime <= currentTime && job.remainingTime > 0
                );

                if (availableJobs.length === 0) {
                    currentTime = Math.min(...remainingJobs
                        .filter(job => job.remainingTime > 0)
                        .map(job => job.arrivalTime)
                    );
                    continue;
                }

                const shortestJob = availableJobs.reduce((prev, curr) => 
                    prev.remainingTime < curr.remainingTime ? prev : curr
                );

                shortestJob.remainingTime--;
                
                if (!shortestJob.timeline.length || 
                    shortestJob.timeline[shortestJob.timeline.length - 1].end !== currentTime) {
                    shortestJob.timeline.push({
                        start: currentTime,
                        end: currentTime + 1
                    });
                } else {
                    shortestJob.timeline[shortestJob.timeline.length - 1].end = currentTime + 1;
                }

                if (shortestJob.remainingTime === 0) {
                    const completionTime = currentTime + 1;
                    const turnaroundTime = completionTime - shortestJob.arrivalTime;
                    const waitingTime = turnaroundTime - shortestJob.burstTime;

                    result.push({
                        ...shortestJob,
                        completionTime,
                        turnaroundTime,
                        waitingTime,
                        timeline: shortestJob.timeline
                    });
                }

                currentTime++;
            }

            return result;
        }

        function RoundRobin(jobs, timeQuantum) {
            let currentTime = 0;
            const result = [];
            const queue = [];
            const remainingJobs = jobs.map(job => ({...job, remainingTime: job.burstTime, timeline: []}));
            
            while (remainingJobs.some(job => job.remainingTime > 0) || queue.length > 0) {
                // Add newly arrived jobs to queue
                remainingJobs
                    .filter(job => job.arrivalTime <= currentTime && job.remainingTime > 0)
                    .forEach(job => {
                        if (!queue.includes(job)) {
                            queue.push(job);
                        }
                    });

                if (queue.length === 0) {
                    currentTime = Math.min(...remainingJobs
                        .filter(job => job.remainingTime > 0)
                        .map(job => job.arrivalTime)
                    );
                    continue;
                }

                const currentJob = queue.shift();
                const executionTime = Math.min(timeQuantum, currentJob.remainingTime);

                currentJob.timeline.push({
                    start: currentTime,
                    end: currentTime + executionTime
                });

                currentJob.remainingTime -= executionTime;
                currentTime += executionTime;

                if (currentJob.remainingTime > 0) {
                    queue.push(currentJob);
                } else {
                    const completionTime = currentTime;
                    const turnaroundTime = completionTime - currentJob.arrivalTime;
                    const waitingTime = turnaroundTime - currentJob.burstTime;

                    result.push({
                        ...currentJob,
                        completionTime,
                        turnaroundTime,
                        waitingTime,
                        timeline: currentJob.timeline
                    });
                }
            }

            return result;
        }

        function getJobsFromInputs() {
            const jobs = [];
            const jobInputs = document.getElementById('jobInputs').children;

            for (let i = 0; i < jobInputs.length; i++) {
                const inputs = jobInputs[i].getElementsByTagName('input');
                jobs.push({
                    id: i,
                    name: inputs[0].value,
                    arrivalTime: parseInt(inputs[1].value),
                    burstTime: parseInt(inputs[2].value)
                });
            }

            return jobs;
        }

     /*   function createGanttChart(results, containerId) {
            const container = document.getElementById(containerId);
            const canvas = document.createElement('canvas');
            canvas.style.width = '100%';
            canvas.style.height = '300px';
            container.appendChild(canvas);

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, container.clientWidth / 300, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
            renderer.setSize(container.clientWidth, 300);

            // Calculate timeline bounds
            const maxTime = Math.max(...results.map(job => 
                Math.max(...job.timeline.map(t => t.end))
            ));

            camera.position.z = maxTime * 0.75;
            camera.position.y = maxTime * 0.3;

            results.forEach((job, jobIndex) => {
                job.timeline.forEach(time => {
                    const width = time.end - time.start;
                    const geometry = new THREE.BoxGeometry(width, 1, 1);
                    const material = new THREE.MeshPhongMaterial({ 
                        color: colors[jobIndex % colors.length]
                    });
                    const cube = new THREE.Mesh(geometry, material);
                    
                    cube.position.x = time.start + width / 2 - maxTime / 2;
                    cube.position.y = jobIndex * 1.5;
                    
                    scene.add(cube);
                });
            });

            // Add lighting
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(1, 1, 1);
            scene.add(light);
            
            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);

            // Add time scale
            const timeScale = new THREE.GridHelper(maxTime, maxTime);
            timeScale.position.y = -1;
            scene.add(timeScale);

            function animate() {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
                
                // Rotate the chart slightly for better 3D effect
                scene.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
            }
            
            animate();
        }
     function createGanttChart(results, containerId) {
   const container = document.getElementById(containerId);
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '300px';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / 300, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(container.getBoundingClientRect().clientWidth, 300);

    // Calculate timeline bounds
    const maxTime = Math.max(...results.map(job => 
        Math.max(...job.timeline.map(t => t.end))
    ));

    camera.position.z = maxTime * 0.75;
    camera.position.y = maxTime * 0.3;

    // Create a group to hold all objects
    const chartGroup = new THREE.Group();

    // Add job blocks
    results.forEach((job, jobIndex) => {
        job.timeline.forEach(time => {
            const width = time.end - time.start;
            const geometry = new THREE.BoxGeometry(width, 1, 1);
            const material = new THREE.MeshPhongMaterial({ 
                color: colors[jobIndex % colors.length]
            });
            const cube = new THREE.Mesh(geometry, material);
            
            cube.position.x = time.start + width / 2 - maxTime / 2;
            cube.position.y = jobIndex * 1.5;
            
            // Add job label with black text
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 64;
            canvas.height = 32;
            ctx.fillStyle = 'black';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(job.name, canvas.width/2, canvas.height/2);

            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.SpriteMaterial({ map: texture });
            const label = new THREE.Sprite(labelMaterial);
            label.scale.set(2, 1, 1);
            label.position.set(cube.position.x, cube.position.y + 0.8, 0.5);
            
            chartGroup.add(cube);
            chartGroup.add(label);
        });
    });

    // Add grid
    const gridHelper = new THREE.GridHelper(maxTime, maxTime, 0x000000, 0x000000);
    gridHelper.position.y = -1;
    gridHelper.position.x = 0;
    chartGroup.add(gridHelper);

    // Add time axis
    const timeAxisGeometry = new THREE.BoxGeometry(maxTime, 0.1, 0.1);
    const timeAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const timeAxis = new THREE.Mesh(timeAxisGeometry, timeAxisMaterial);
    timeAxis.position.x = 0;
    timeAxis.position.y = -2;
    chartGroup.add(timeAxis);

    // Add time labels with black text
    for (let t = 0; t <= maxTime; t += Math.ceil(maxTime / 10)) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 32;
        canvas.height = 32;
        ctx.fillStyle = 'black';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.toString(), canvas.width/2, canvas.height/2);

        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({ map: texture });
        const label = new THREE.Sprite(labelMaterial);
        label.scale.set(1, 1, 1);
        label.position.set(t - maxTime/2, -2.5, 0);
        chartGroup.add(label);
    }

    scene.add(chartGroup);

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Add legend with black text
    const legendContainer = document.createElement('div');
    legendContainer.className = 'mt-4 flex flex-wrap gap-4 justify-center text-black font-semibold';
    legendContainer.innerHTML = results.map((job, index) => `
        <div class="flex items-center">
            <div class="w-4 h-4 mr-2" style="background-color: ${colors[index % colors.length]}"></div>
            <span>${job.name}</span>
        </div>
    `).join('');
    container.appendChild(legendContainer);

    // Interactive controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotation = { x: 0, y: 0 };

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaMove = {
                x: e.offsetX - previousMousePosition.x,
                y: e.offsetY - previousMousePosition.y
            };

            rotation.x += deltaMove.y * 0.005;
            rotation.y += deltaMove.x * 0.005;

            chartGroup.rotation.x = rotation.x;
            chartGroup.rotation.y = rotation.y;
        }

        previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY
        };
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera.position.z += e.deltaY * 0.01;
        camera.position.z = Math.max(maxTime * 0.3, Math.min(maxTime * 1.5, camera.position.z));
    });

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        
        if (!isDragging) {
            chartGroup.rotation.y += 0.001;
        }
    }
    
    animate();
}*/

function createGanttChart(results, containerId) {
    const container = document.getElementById(containerId);
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '300px';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / 300, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, 300);

    // Calculate timeline bounds
    const maxTime = Math.max(...results.map(job => 
        Math.max(...job.timeline.map(t => t.end))
    ));

    camera.position.z = maxTime * 0.75;
    camera.position.y = maxTime * 0.3;

    // Create a group to hold all objects
    const chartGroup = new THREE.Group();

    // Add job blocks
    results.forEach((job, jobIndex) => {
        job.timeline.forEach(time => {
            const width = time.end - time.start;
            const geometry = new THREE.BoxGeometry(width, 1, 1);
            const material = new THREE.MeshPhongMaterial({ 
                color: colors[jobIndex % colors.length]
            });
            const cube = new THREE.Mesh(geometry, material);
            
            cube.position.x = time.start + width / 2 - maxTime / 2;
            cube.position.y = jobIndex * 1.5;
            
            // Add job label with black text
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 64;
            canvas.height = 32;
            ctx.fillStyle = 'black';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(job.name, canvas.width/2, canvas.height/2);

            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.SpriteMaterial({ map: texture });
            const label = new THREE.Sprite(labelMaterial);
            label.scale.set(2, 1, 1);
            label.position.set(cube.position.x, cube.position.y + 0.8, 0.5);
            
            chartGroup.add(cube);
            chartGroup.add(label);
        });
    });

    // Add grid
    const gridHelper = new THREE.GridHelper(maxTime, maxTime, 0x000000, 0x000000);
    gridHelper.position.y = -1;
    gridHelper.position.x = 0;
    chartGroup.add(gridHelper);

    // Add time axis
    const timeAxisGeometry = new THREE.BoxGeometry(maxTime, 0.1, 0.1);
    const timeAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const timeAxis = new THREE.Mesh(timeAxisGeometry, timeAxisMaterial);
    timeAxis.position.x = 0;
    timeAxis.position.y = -2;
    chartGroup.add(timeAxis);

    // Add time labels with black text
    for (let t = 0; t <= maxTime; t += Math.ceil(maxTime / 10)) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 32;
        canvas.height = 32;
        ctx.fillStyle = 'black';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.toString(), canvas.width/2, canvas.height/2);

        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({ map: texture });
        const label = new THREE.Sprite(labelMaterial);
        label.scale.set(1, 1, 1);
        label.position.set(t - maxTime/2, -2.5, 0);
        chartGroup.add(label);
    }

    scene.add(chartGroup);

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Add legend with black text
    const legendContainer = document.createElement('div');
    legendContainer.className = 'mt-4 flex flex-wrap gap-4 justify-center text-black font-semibold';
    legendContainer.innerHTML = results.map((job, index) => `
        <div class="flex items-center">
            <div class="w-4 h-4 mr-2" style="background-color: ${colors[index % colors.length]}"></div>
            <span>${job.name}</span>
        </div>
    `).join('');
    container.appendChild(legendContainer);

    // Interactive controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotation = { x: 0, y: 0 };

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaMove = {
                x: e.offsetX - previousMousePosition.x,
                y: e.offsetY - previousMousePosition.y
            };

            rotation.x += deltaMove.y * 0.005;
            rotation.y += deltaMove.x * 0.005;

            chartGroup.rotation.x = rotation.x;
            chartGroup.rotation.y = rotation.y;
        }

        previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY
        };
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera.position.z += e.deltaY * 0.01;
        camera.position.z = Math.max(maxTime * 0.3, Math.min(maxTime * 1.5, camera.position.z));
    });

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        
        if (!isDragging) {
            chartGroup.rotation.y += 0.001;
        }
    }
    
    animate();
}
        

        function displayResults(results, algorithmName, containerId) {
            const container = document.createElement('div');
            container.className = 'bg-white p-6 rounded-lg shadow-md';
            container.id = containerId;

            // Create table
            const table = document.createElement('table');
            table.className = 'w-full mb-4';
            table.innerHTML = `
                <thead>
                    <tr class="bg-gray-100">
                        <th class="p-2">Job</th>
                        <th class="p-2">Arrival Time</th>
                        <th class="p-2">Burst Time</th>
                        <th class="p-2">Completion Time</th>
                        <th class="p-2">Turnaround Time</th>
                        <th class="p-2">Waiting Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(job => `
                        <tr>
                            <td class="p-2 text-center">${job.name}</td>
                            <td class="p-2 text-center">${job.arrivalTime}</td>
                            <td class="p-2 text-center">${job.burstTime}</td>
                            <td class="p-2 text-center">${job.completionTime}</td>
                            <td class="p-2 text-center">${job.turnaroundTime}</td>
                            <td class="p-2 text-center">${job.waitingTime}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;

            // Calculate and display averages
            const avgTurnaround = results.reduce((sum, job) => sum + job.turnaroundTime, 0) / results.length;
            const avgWaiting = results.reduce((sum, job) => sum + job.waitingTime, 0) / results.length;

            const averages = document.createElement('div');
            averages.className = 'mb-6 text-lg';
            averages.innerHTML = `
                <h3 class="text-xl font-semibold mb-4">${algorithmName} Results:</h3>
                <p class="mb-2">Average Turnaround Time: ${avgTurnaround.toFixed(2)}</p>
                <p>Average Waiting Time: ${avgWaiting.toFixed(2)}</p>
            `;

            container.appendChild(averages);
            container.appendChild(table);

            // Add Gantt chart title
            const ganttTitle = document.createElement('h3');
            ganttTitle.className = 'text-xl font-semibold my-4';
            ganttTitle.textContent = 'Gantt Chart';
            container.appendChild(ganttTitle);

            // Add container for Gantt chart
            const ganttContainer = document.createElement('div');
            ganttContainer.className = 'w-full h-[300px] border rounded-lg';
            container.appendChild(ganttContainer);

            document.getElementById('results').appendChild(container);

            // Create Gantt chart
            createGanttChart(results, containerId);
        }

        function runSelected() {
            const algorithm = document.getElementById('algorithm').value;
            const jobs = getJobsFromInputs();
            const containerId = `results-${Date.now()}`;
            
            let results;
            let algorithmName;

            switch(algorithm) {
                case 'fcfs':
                    results = FCFS(jobs);
                    algorithmName = 'First Come First Serve (FCFS)';
                    break;
                case 'sjf':
                    results = SJF(jobs);
                    algorithmName = 'Shortest Job First (SJF)';
                    break;
                case 'srtf':
                    results = SRTF(jobs);
                    algorithmName = 'Shortest Remaining Time First (SRTF)';
                    break;
                case 'rr':
                    const timeQuantum = parseInt(document.getElementById('timeQuantum').value);
                    results = RoundRobin(jobs, timeQuantum);
                    algorithmName = `Round Robin (RR) - Time Quantum: ${timeQuantum}`;
                    break;
            }

            displayResults(results, algorithmName, containerId);
        }

        function runAll() {
            const jobs = getJobsFromInputs();
            const timeQuantum = parseInt(document.getElementById('timeQuantum').value);
            
            document.getElementById('results').innerHTML = '';

            // Run all algorithms
            const algorithms = [
                {func: FCFS, name: 'First Come First Serve (FCFS)'},
                {func: SJF, name: 'Shortest Job First (SJF)'},
                {func: SRTF, name: 'Shortest Remaining Time First (SRTF)'},
                {
                    func: (jobs) => RoundRobin(jobs, timeQuantum),
                    name: `Round Robin (RR) - Time Quantum: ${timeQuantum}`
                }
            ];

            algorithms.forEach((algo, index) => {
                const results = algo.func(jobs);
                displayResults(results, algo.name, `results-${Date.now()}-${index}`);
            });
        }

        function clearAll() {
            document.getElementById('results').innerHTML = '';
            document.getElementById('jobInputs').innerHTML = '';
            document.getElementById('jobCount').value = '3';
            document.getElementById('algorithm').value = 'fcfs';
            document.getElementById('timeQuantum').value = '2';
            document.getElementById('timeQuantumDiv').classList.add('hidden');
        }

        // Initialize with some default jobs
        generateJobInputs();


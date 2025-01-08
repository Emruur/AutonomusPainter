let drawings = []; // Array to hold images of drawings
const gridRows = 3; // Number of rows in the grid
const gridCols = 4; // Number of columns in the grid
let cellWidth, cellHeight;

let path= []
let paths= []

let selectedCells = []
let maxSelections = 3

let currentDrawingParams= []
let parentDrawingParams= []

const paramRanges = {
	numOfVehicles: { min: 1, max: 300 },
	trackingIterations: { min: 100, max: 1500 },
	flowFieldResolution: { min: 2, max: 200 },
	attractionRadius: { min: 5, max: 100 },
	maxVehicleForce: { min: 0.2, max: 5 },
	maxVehicleSpeed: { min: 1, max: 10 },
	maxVehicleStroke: { min: 1, max: 10 },
	maxVehicleTrailLength: { min: 10, max: 200 },
	vehicleStrokeUp: { min: 0.01, max: 2 },
	vehicleStrokeDecay: { min: 0.01, max: 2 },
	filteredOrientations: {min:1, max: 3},
};


const State = Object.freeze({
    DRAW: "DRAW",
	DRAWING: "DRAWING",
	LOADING: "LOADING",
	GRID: "GRID",
});
let state= State.DRAW

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(20,20,40);

	// Define grid cell dimensions
	cellWidth = width / gridCols;
	cellHeight = height / gridRows;
}

function drawSpinner() {
	push();
	translate(width / 2, height / 2);
	rotate(frameCount * 0.1); // Smooth rotation based on frameCount
	noFill();
	stroke(255);
	strokeWeight(4);
	arc(0, 0, 50, 50, 0, PI * 1.5); // Draw a rotating arc
	pop();
}
  

function drawPaths() {
	
	for (let p of [...paths, path]){
		if (p.length < 2) continue; // No need to draw if there are fewer than 2 points

		stroke(0); // Set the line color
		strokeWeight(3); // Set the line thickness
		noFill(); // No fill for shapes

		beginShape();
		for (let v of p) {
			vertex(v.x, v.y); // Use the vertex function to define the shape
		}
		endShape();
	}
	
}
function keyPressed() {
    if (key === 'f' || key === 'F') {
        renderDrawings();
    }

    if (key === 's' || key === 'S') {
        for (let selectionIndex of selectedCells) {
            selectionIndex = selectionIndex.index;
            let currParams = currentDrawingParams[selectionIndex];
            
            // Log the raw compact JSON string
            const rawJSON = JSON.stringify(currParams); // Compact JSON
            console.log(rawJSON);

            // Render the drawing for the logged params
            let tempCanvas = createGraphics(windowWidth, windowHeight);
            renderDrawing(tempCanvas, currParams);

            // Save the rendered drawing as an image
            const imageFilename = `rendered_drawing_${selectionIndex}.png`;
            tempCanvas.save(imageFilename);

        }
    }
}

function mousePressed() {
	if (state === State.GRID) {
		let index = 0;

		for (let row = 0; row < gridRows; row++) {
		for (let col = 0; col < gridCols; col++) {
			let x = col * cellWidth;
			let y = row * cellHeight;

			// Check if mouse is inside the cell
			if (
			mouseX > x &&
			mouseX < x + cellWidth &&
			mouseY > y &&
			mouseY < y + cellHeight
			) {
			const existingIndex = selectedCells.findIndex(
				(cell) => cell.index === index
			);

			if (existingIndex !== -1) {
				// If already selected, deselect the cell
				selectedCells.splice(existingIndex, 1);
			} else {
				// Add the cell to the selected list (respect maxSelections limit)
				if (selectedCells.length < maxSelections) {
				selectedCells.push({ index: index });
				}
			}
			break;
			}

			index++;
		}
		}
	}
}
  
  

function draw() {
	background(20, 20, 40);

	if (state === State.LOADING) {
		drawSpinner();
		return;
	}

	if (state === State.DRAW || state === State.DRAWING) {
		drawPaths();

		if (mouseIsPressed) {
		state = State.DRAWING;
		path.push(createVector(mouseX, mouseY));
		} else if (state === State.DRAWING && !mouseIsPressed) {
		paths.push(path);
		path = [];
		state = State.DRAW;
		}
	}

	if (state === State.GRID) {
		if(selectedCells.length == maxSelections){
			parentDrawingParams= []
			for(let selectionIndex of selectedCells){
				selectionIndex= selectionIndex.index
				currParams= currentDrawingParams[selectionIndex]
				parentDrawingParams.push(currParams)
			}
			selectedCells= []
			evolveDrawingParams()
			renderDrawings()
		}
		let index = 0;

		for (let row = 0; row < gridRows; row++) {
		for (let col = 0; col < gridCols; col++) {
			if (index < drawings.length) {
			let x = col * cellWidth;
			let y = row * cellHeight;

			// Display the image
			image(drawings[index], x, y, cellWidth, cellHeight);

			// Highlight the hovered cell
			if (
				mouseX > x &&
				mouseX < x + cellWidth &&
				mouseY > y &&
				mouseY < y + cellHeight
			) {
				noFill();
				stroke(255, 255, 0); // Yellow border for hover
				strokeWeight(4);
				rect(x, y, cellWidth, cellHeight);
			}

			// Draw persistent border and selection order as a fraction
			const selectionIndex = selectedCells.findIndex(
				(cell) => cell.index === index
			);

			if (selectionIndex !== -1) {
				noFill();
				stroke(0, 255, 0); // Green border for selected
				strokeWeight(4);
				rect(x, y, cellWidth, cellHeight);

				// Display the fraction (e.g., "1/3", "2/3")
				fill(255); // White color for text
				noStroke();
				textSize(16);
				textAlign(RIGHT, TOP);
				text(`${selectionIndex + 1}/${maxSelections}`, x + cellWidth - 5, y + 5); // Top-right corner
			}

			index++;
			}
		}
		}
	}
}

async function renderDrawings() {
	state = State.LOADING; // Set state to LOADING to show the spinner
  
	drawings = []; // Clear the previous drawings array
  
	for (let i = 0; i < gridRows * gridCols; i++) {
		let drawingParams
		if (currentDrawingParams.length < gridCols*gridRows)
			drawingParams = generateRandomParams();
		else
			drawingParams= currentDrawingParams[i]

		currentDrawingParams.push(drawingParams)
		let graphicsCanvas = createGraphics(windowWidth, windowHeight);
	
		// Render the drawing on the off-screen canvas
		await new Promise((resolve) => {
			setTimeout(() => {
			renderDrawing(graphicsCanvas, drawingParams);
			resolve();
			}, 0); // Non-blocking execution
		});
	
		// Save the rendered canvas as an image
		let img = graphicsCanvas.get();
		img.resize(cellWidth, cellHeight);
		drawings.push(img);
	}
  
	state = State.GRID; // Switch to the GRID state after rendering
}
  
function renderDrawing(graphicsCanvas, drawingParams) {
	graphicsCanvas.background(10, 20, 30);

	for (let path of paths) {
		let drawingAgent = new DrawingAgent(drawingParams);
		drawingAgent.setVehicles();

		// Initialize flow fields for all orientations
		drawingAgent.horizontal_rl.flowField = new FlowField(InitType.HORIZONTAL_RL, drawingParams);
		drawingAgent.horizontal_lr.flowField = new FlowField(InitType.HORIZONTAL_LR, drawingParams);
		drawingAgent.vertical_td.flowField = new FlowField(InitType.VERTICAL_TD, drawingParams);
		drawingAgent.vertical_dt.flowField = new FlowField(InitType.VERTICAL_DT, drawingParams);

		// Calculate prominent angle for the path
		let prominentAngle = calculateProminentOrientation(path);

		// Get matching agents based on the prominent angle
		let matchingAgents = new Set(determineClosestDirections(prominentAngle, drawingParams.filteredOrientations));


		// Filter the drawing agent to retain only matching orientations
		drawingAgent = filterDrawingAgent(drawingAgent, matchingAgents);

		const baseColor = [120, 120, 120]; // Base color from palette
		const perturbation = 40; // Color perturbation range

		// Iterate through the filtered orientations and assign colors
		matchingAgents.forEach((group) => {
			for (let vehicle of drawingAgent[group].vehicles) {
				let r = constrain(baseColor[0] + random(-perturbation, perturbation), 0, 255);
				let g = constrain(baseColor[1] + random(-perturbation, perturbation), 0, 255);
				let b = constrain(baseColor[2] + random(-perturbation, perturbation), 0, 255);
				drawingAgent[group].vehicleColors.push([r, g, b]);
			}
		});

		// Attract the field to the path
		drawingAgent.attractFieldToPath(path);

		// Perform the flow for the specified number of tracking iterations
		for (let i = 0; i < drawingParams.trackingIterations; i++) {
			drawingAgent.flow();
		}

		// Render the drawing agent on the canvas
		drawingAgent.show(graphicsCanvas);
	}
}


function generateRandomParams() {
	const params = {};
	for (let key in paramRanges) {
		const range = paramRanges[key];
		params[key] = random(range.min, range.max);
		if (Number.isInteger(range.min) && Number.isInteger(range.max)) {
		params[key] = int(params[key]); // Ensure integers for specific parameters
		}
	}
	return params;
}
  

//ES

function mutate(params) {
	const mutated = { ...params };
	for (let key in mutated) {
		if (random() < 0.1) { // 10% chance to mutate this parameter
		const range = paramRanges[key];
		const mutationAmount = (range.max - range.min) * 0.2; // 10% of the range
		mutated[key] += random(-mutationAmount, mutationAmount);

		// Clamp the value to the defined range
		mutated[key] = constrain(mutated[key], range.min, range.max);

		// Ensure integers for specific parameters
		if (Number.isInteger(range.min) && Number.isInteger(range.max)) {
			mutated[key] = int(mutated[key]);
		}
		}
	}
	return mutated;
}
  
function evolveDrawingParams() {
	state = State.LOADING
	currentDrawingParams= []
	const totalParams = gridRows * gridCols;

	// Helper function: Perform crossover between two parent objects
	function crossover(parentA, parentB) {
		const child = {};
		for (let key in parentA) {
		// Randomly inherit from either parent
		child[key] = random([parentA[key], parentB[key]]);
		}
		return child;
	}

	// Generate new parameters
	for (let i = 0; i < totalParams; i++) {
		// Randomly select two parents for crossover
		const parentA = random(parentDrawingParams);
		const parentB = random(parentDrawingParams);

		// Perform crossover and mutation
		const child = mutate(crossover(parentA, parentB));

		currentDrawingParams.push(child);
	}

}
  
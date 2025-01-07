let drawings = []; // Array to hold images of drawings
const gridRows = 3; // Number of rows in the grid
const gridCols = 3; // Number of columns in the grid
let cellWidth, cellHeight;

let path= []
let paths= []

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
	noFill();
	stroke(255);
	strokeWeight(4);
	let angle = frameCount * 0.1;
	arc(0, 0, 50, 50, angle, angle + PI * 1.5);
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
	if (key === 'f' || key === 'F') { // Check for both lowercase and uppercase 'F'
		state= State.GRID
		renderDrawings()
		console.log("finito")
	}
}

function draw() {
	background(20, 20, 40);
  
	if (state === State.LOADING) {
	  drawSpinner(); // Display the spinner while loading
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
	  let index = 0;
	  for (let row = 0; row < gridRows; row++) {
		for (let col = 0; col < gridCols; col++) {
		  if (index < drawings.length) {
			let x = col * cellWidth;
			let y = row * cellHeight;
			image(drawings[index], x, y, cellWidth, cellHeight); // Display the saved image
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
	  const drawingParams = generateRandomParams();
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

	for(let path of paths){
		let drawingAgent= new DrawingAgent()
		drawingAgent.setVehicles(drawingParams)
		drawingAgent.horizontal_rl.flowField= new FlowField(InitType.HORIZONTAL_RL, drawingParams)
		drawingAgent.horizontal_lr.flowField= new FlowField(InitType.HORIZONTAL_LR, drawingParams)
		drawingAgent.vertical_td.flowField= new FlowField(InitType.VERTICAL_TD, drawingParams)
		drawingAgent.vertical_dt.flowField= new FlowField(InitType.VERTICAL_DT, drawingParams)

		const baseColor = [120,120,120]; // Sample one base color from the selected palette
		const perturbation = 40; // Neighborhood range for random sampling

		// Apply the same base color with perturbation to all groups
		["horizontal_lr", "horizontal_rl", "vertical_td", "vertical_dt"].forEach((group) => {
			for (let vehicle of drawingAgent[group].vehicles) {
				let r = constrain(baseColor[0] + random(-perturbation, perturbation), 0, 255);
				let g = constrain(baseColor[1] + random(-perturbation, perturbation), 0, 255);
				let b = constrain(baseColor[2] + random(-perturbation, perturbation), 0, 255);
				drawingAgent[group].vehicleColors.push([r, g, b]);
			}
		});
	
		drawingAgent.attractFieldToPath(path)
		for (let i = 0; i < drawingParams.trackingIterations; i++) {
			drawingAgent.flow()
		}
		drawingAgent.show(graphicsCanvas)
	}

}

function generateRandomParams() {
	return {
		numOfVehicles: int(random(10, 100)),
		trackingIterations: int(random(500, 1500)),
		flowFieldResolution: int(random(3, 10)),
		attractionRadius: random(10, 30),
		maxVehicleForce: random(0.5, 3),
		maxVehicleSpeed: random(1, 5),
		maxVehicleStroke: random(1, 5),
		maxVehicleTrailLength: int(random(30, 100)),
		vehicleStrokeUp: random(0.1, 0.5),
		vehicleStrokeDecay: random(0.1, 0.5),
	};
}

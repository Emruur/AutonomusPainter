// tune.js

let path = [];
let paths = [];

const State = Object.freeze({
    DRAW: "DRAW",
    FLOW: "FLOW",
});

state= State.DRAW

let drawingParams = {
	numOfVehicles: 50,
	trackingIterations: 1000,
	flowFieldResolution: 5, // Lower is higher resolution
	attractionRadius: 20,
	maxVehicleForce: 1,
	maxVehicleSpeed: 2,
	maxVehicleStroke: 2,
	maxVehicleTrailLength: 50,
	vehicleStrokeUp: 0.5,
	vehicleStrokeDecay: 0.5,
};

const paramRanges = {
	numOfVehicles: { min: 1, max: 300, step: 1 }, // Increment by 1 for precise control
	trackingIterations: { min: 100, max: 1500, step: 50 }, // Larger increments for performance considerations
	flowFieldResolution: { min: 4, max: 200, step: 1 }, // High resolution requires small steps
	attractionRadius: { min: 5, max: 100, step: 5 }, // Reasonable radius increments
	maxVehicleForce: { min: 0.2, max: 5, step: 0.1 }, // Small steps for force control
	maxVehicleSpeed: { min: 1, max: 10, step: 0.5 }, // Intermediate steps for speed control
	maxVehicleStroke: { min: 1, max: 10, step: 0.5 }, // Intermediate steps for stroke control
	maxVehicleTrailLength: { min: 10, max: 200, step: 10 }, // Larger increments for trail length
	vehicleStrokeUp: { min: 0.1, max: 1, step: 0.1 }, // Small increments for smooth stroke changes
	vehicleStrokeDecay: { min: 0.1, max: 1, step: 0.1 }, // Small increments for smooth decay
};
  
function randomInRange({ min, max, step }) {
    const range = Math.floor((max - min) / step);
    return min + Math.floor(Math.random() * (range + 1)) * step;
}


function setup() {
  let canvas = createCanvas(windowWidth * 0.6, windowHeight);
  canvas.parent("canvas-container");
  background(20, 20, 40);
  setupSliders();
}

function draw() {
    if (state!== State.FLOW){
        background(20, 20, 40);
        drawPaths();
    }
}

function mousePressed() {
  path = [];
}

function mouseDragged() {
  path.push(createVector(mouseX, mouseY));
}

function mouseReleased() {
  if (path.length > 0) paths.push(path);
}

function play() {
	state = State.FLOW
	background(20, 20, 40);
	renderDrawing();
}

function drawPaths() {
  noFill();
  stroke(200);
  strokeWeight(2);
  let new_paths = [...paths, path];
  for (let p of new_paths) {
    beginShape();
    for (let v of p) vertex(v.x, v.y);
    endShape();
  }
}

// Fixed renderDrawing function
function renderDrawing() {
    background(20, 20, 40);
    for (let p of paths) {
        if (p.length < 2) continue;
        
        let drawingAgent = new DrawingAgent(drawingParams);
        drawingAgent.setVehicles();
    
        drawingAgent.horizontal_rl.flowField = new FlowField(InitType.HORIZONTAL_RL, drawingParams);
        drawingAgent.horizontal_lr.flowField = new FlowField(InitType.HORIZONTAL_LR, drawingParams);
        drawingAgent.vertical_td.flowField = new FlowField(InitType.VERTICAL_TD, drawingParams);
        drawingAgent.vertical_dt.flowField = new FlowField(InitType.VERTICAL_DT, drawingParams);

        let prominentAngle = calculateProminentOrientation(path);

        // Get matching agents based on the prominent angle
        let matchingAgents = new Set(determineClosestDirections(prominentAngle, 4));


        // Filter the drawing agent to retain only matching orientations
        drawingAgent = filterDrawingAgent(drawingAgent, matchingAgents);
  
        let baseColor = [50,100,160]
        const perturbation = 40; // Color variation range
    
        matchingAgents.forEach((group) => {
			for (let vehicle of drawingAgent[group].vehicles) {
				let r = constrain(baseColor[0] + random(-perturbation, perturbation), 0, 255);
				let g = constrain(baseColor[1] + random(-perturbation, perturbation), 0, 255);
				let b = constrain(baseColor[2] + random(-perturbation, perturbation), 0, 255);
				drawingAgent[group].vehicleColors.push([r, g, b]);
			}
		});
    
        drawingAgent.attractFieldToPath(p);
        for (let i = 0; i < drawingParams.trackingIterations; i++) {
            drawingAgent.flow();
        }
        drawingAgent.show();
    }
}
  
function setupSliders() {
    const slidersContainer = document.getElementById("sliders-container");

    for (let key in paramRanges) {
        const sliderDiv = document.createElement("div");
        sliderDiv.style.marginBottom = "10px";

        const label = document.createElement("span");
        label.textContent = key;
        label.style.marginRight = "10px";
        sliderDiv.appendChild(label);

        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = paramRanges[key].min;
        slider.max = paramRanges[key].max;
        slider.value = drawingParams[key];
        slider.step = paramRanges[key].step;

        slider.setAttribute("data-key", key); // Add the `data-key` attribute
        slider.addEventListener("input", () => {
            drawingParams[key] = parseFloat(slider.value);
            renderDrawing();
        });
        sliderDiv.appendChild(slider);

        slidersContainer.appendChild(sliderDiv);
    }
}

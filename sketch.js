
class DrawingAgent {
	constructor() {
	  this.horizontal_lr = new AgentGroup();
	  this.horizontal_rl = new AgentGroup();
	  this.vertical_td = new AgentGroup();
	  this.vertical_dt = new AgentGroup();
	}

	setVehicles(){
		this.horizontal_lr.vehicles = []
		this.horizontal_rl.vehicles = []
		this.vertical_td.vehicles = []
		this.vertical_dt.vehicles = []
		for(let i = 0; i< drawingParams.numOfVehicles; i++){
			//Horizontals
			let y= i * (windowHeight/ drawingParams.numOfVehicles)
			let x= 10
			this.horizontal_lr.vehicles.push(new Vehicle(x,y, drawingParams))
	
			//Horizontals
			y= i * (windowHeight/ drawingParams.numOfVehicles)
			x= windowWidth -10
			this.horizontal_rl.vehicles.push(new Vehicle(x,y, drawingParams))
	
			//Verticals
			y= 10
			x= i * (windowWidth/ drawingParams.numOfVehicles)
			this.vertical_td.vehicles.push(new Vehicle(x,y, drawingParams))
	
			//Verticals
			y= windowHeight -10
			x= i * (windowWidth/ drawingParams.numOfVehicles)
			this.vertical_dt.vehicles.push(new Vehicle(x,y, drawingParams))
		}
	}

	flow(){
		Object.entries(this).forEach(([key, agent]) => {
			agent.flow()
		});
	}

	show(){
		Object.entries(this).forEach(([key, agent]) => {
			for (let i = 0; i < agent.vehicles.length; i++) {
				const vehicle = agent.vehicles[i];
				const color = agent.vehicleColors[i]; // Assuming this array has the same length as vehicles
			
				// Use color[0], color[1], color[2] as r, g, b respectively
				vehicle.showTrail(color[0], color[1], color[2]);
			}
		});
	}
  }
  
  class AgentGroup {
	constructor() {
	  this.vehicles = [];
	  this.flowField = null;
	  this.vehicleColors = [];
	}

	flow(){
		
		for (let vehicle of this.vehicles) {
			let identifier = vehicle.follow(this.flowField);
			vehicle.update();
			vehicle.wrapAround();
			let draw_with_vehicle = vehicle.draw(identifier > 0);
			if (!draw_with_vehicle) {
				break;
			}
        }
	}
}

let drawingAgents= []
let path= []
let palettes;

function preload() {
	// Load the palettes.json file
	palettes = loadJSON('palettes.json', () => {
		console.log('Palettes loaded successfully.');
	}, (err) => {
		console.error('Error loading palettes:', err);
	});
}
function getRandomColorFromPalettes(palettes) {
    const paletteNames = Object.keys(palettes);
    const randomPaletteName = random(paletteNames); // p5.js random
    const randomPalette = palettes[randomPaletteName];
    return random(randomPalette); // Random color from the selected palette
}


const drawingParams = {
	numOfVehicles: 50,
	trackingIterations: 1000,
	flowFieldResolution: 5, // Lower is higher resolution
	attractionRadius: 20,
	maxVehicleForce: 1,
	maxVehicleSpeed: 2,
	maxVehicleStroke: 2,
	maxVehicleTrailLength: 50,
	vehicleStrokeUp: 0.2,
	vehicleStrokeDecay: 0.2,
  };

const State = Object.freeze({
    DRAW: "DRAW",
	DRAWING: "DRAWING",
    FLOW: "FLOW",
});

let state= State.DRAW

function drawPath(path) {
	if (path.length < 2) return; // No need to draw if there are fewer than 2 points

	stroke(0); // Set the line color
	strokeWeight(2); // Set the line thickness
	noFill(); // No fill for shapes

	beginShape();
	for (let v of path) {
		vertex(v.x, v.y); // Use the vertex function to define the shape
	}
	endShape();
}

function keyPressed() {
	if (key === 'f' || key === 'F') { // Check for both lowercase and uppercase 'F'
		state= State.FLOW
		for (let agent of drawingAgents.slice(0, -1)){
			console.log(1, agent)
			agent.setVehicles()
		}

	}
}

function setupNewAgent(){
	let drawingAgent= new DrawingAgent()
	drawingAgent.setVehicles()
	drawingAgent.horizontal_rl.flowField= new FlowField(InitType.HORIZONTAL_RL, drawingParams)
	drawingAgent.horizontal_lr.flowField= new FlowField(InitType.HORIZONTAL_LR, drawingParams)
	drawingAgent.vertical_td.flowField= new FlowField(InitType.VERTICAL_TD, drawingParams)
	drawingAgent.vertical_dt.flowField= new FlowField(InitType.VERTICAL_DT, drawingParams)

	const baseColor = random(selectedPalette); // Sample one base color from the selected palette
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
	
	drawingAgents.push(drawingAgent)
}


function setup() {
	createCanvas(windowWidth, windowHeight); // Canvas covers the entire window
	// Sample a random palette once the sketch is loaded
	const paletteNames = Object.keys(palettes);
	const randomPaletteName = random(paletteNames); // Random palette from available palettes
	selectedPalette = palettes[randomPaletteName]; // Set the selected palette
	console.log(`Selected Palette: ${randomPaletteName}`, selectedPalette);
	setupNewAgent()
	background(20,50,70)
}
  
function windowResized() {
	resizeCanvas(windowWidth, windowHeight); // Adjust canvas size when window is resized
}





function drawWithAgent() {

    // Example agent and vehicle setup (replace with your actual data structure)
    let drawingAgent = drawingAgents[drawingAgents.length - 1];

    // Continue with the rest of your flow logic
    let prominentAngle = calculateProminentOrientation(path);
    let matchingAgents = determineClosestDirections(prominentAngle);
    //let filteredAgent = filterDrawingAgent(drawingAgent, matchingAgents);
	let filteredAgent= drawingAgent

    Object.entries(filteredAgent).forEach(([key, agent]) => {
        agent.flowField.attractToPath(path);
        for (let vehicle of agent.vehicles) {
            for (let i = 0; i < drawingParams.trackingIterations; i++) {
                let identifier = vehicle.follow(agent.flowField);
                vehicle.update();
                let wrapped = vehicle.wrapAround();
                let draw_with_vehicle = vehicle.draw(identifier > 0);
                if (!draw_with_vehicle) {
                    break;
                }
            }
        }
    });

    // Update global state and reset for next iteration
    drawingAgents[drawingAgents.length - 1] = filteredAgent;
    setupNewAgent();
    path = [];
}



function draw(){
	background(10,20,30);

	if (state !== State.FLOW){
		if (mouseIsPressed) {
			state= State.DRAWING
			path.push(createVector(mouseX,mouseY))	
		}
		else if(state === State.DRAWING && !mouseIsPressed){
			drawWithAgent()
			state= State.DRAW
		}
		

		drawPath(path)
		for(let drawingAgent of drawingAgents.slice(0, -1)){ // Exclude the last element)
			drawingAgent.show()
		}
	}

	if(state === State.FLOW){
		for( let agent of drawingAgents){
			agent.flow()
			agent.show()
		}
	}
}
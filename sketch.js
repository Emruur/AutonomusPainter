
class DrawingAgent {
	constructor() {
	  this.horizontal_lr = new AgentGroup();
	  this.horizontal_rl = new AgentGroup();
	  this.vertical_td = new AgentGroup();
	  this.vertical_dt = new AgentGroup();
	}
  }
  
  class AgentGroup {
	constructor() {
	  this.vehicles = [];
	  this.flowField = null;
	  this.vehicleColors = [];
	}
}

let drawingAgents= []
let numOfVehicles= 50
let path= []
let trackingIterations= 1000
let flowFieldResolution= 10

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

function setupNewAgent(){
	let drawingAgent= new DrawingAgent()
	for(let i = 0; i< numOfVehicles; i++){
		//Horizontals
		let y= i * (windowHeight/ numOfVehicles)
		let x= 10
		drawingAgent.horizontal_lr.vehicles.push(new Vehicle(x,y))

		//Horizontals
		y= i * (windowHeight/ numOfVehicles)
		x= windowWidth -10
		drawingAgent.horizontal_rl.vehicles.push(new Vehicle(x,y))

		//Verticals
		y= 10
		x= i * (windowWidth/ numOfVehicles)
		drawingAgent.vertical_td.vehicles.push(new Vehicle(x,y))

		//Verticals
		y= windowHeight -10
		x= i * (windowWidth/ numOfVehicles)
		drawingAgent.vertical_dt.vehicles.push(new Vehicle(x,y))
	}
	drawingAgent.horizontal_rl.flowField= new FlowField(flowFieldResolution, InitType.HORIZONTAL_RL)
	drawingAgent.horizontal_lr.flowField= new FlowField(flowFieldResolution, InitType.HORIZONTAL_LR)
	drawingAgent.vertical_td.flowField= new FlowField(flowFieldResolution, InitType.VERTICAL_TD)
	drawingAgent.vertical_dt.flowField= new FlowField(flowFieldResolution, InitType.VERTICAL_DT)
	
	drawingAgents.push(drawingAgent)
}


function setup() {
	createCanvas(windowWidth, windowHeight); // Canvas covers the entire window
	setupNewAgent()
	background(20,50,70)
}
  
function windowResized() {
	resizeCanvas(windowWidth, windowHeight); // Adjust canvas size when window is resized
}

function flow() {
	let  drawingAgent= drawingAgents[drawingAgents.length -1]

	let baseR = random(255);
	let baseG = random(255);
	let baseB = random(255);

	Object.entries(drawingAgent).forEach(([key, agent]) => {
		for(let vehicle of agent.vehicles){
			let perturbation = 20; // Neighborhood range for random sampling
			let r = constrain(baseR + random(-perturbation, perturbation), 0, 255);
			let g = constrain(baseG + random(-perturbation, perturbation), 0, 255);
			let b = constrain(baseB + random(-perturbation, perturbation), 0, 255);
			agent.vehicleColors.push([r,g,b])
		}
	});

	prominentAngle= calculateProminentOrientation(path)
	matchingAgents= determineClosestDirections(prominentAngle)
	filteredAgent = filterDrawingAgent(drawingAgent, matchingAgents);
	Object.entries(filteredAgent).forEach(([key, agent]) => {
		agent.flowField.attractToPath(path)
		for(let vehicle of agent.vehicles){
			for(let i = 0; i< trackingIterations; i++){
				identifier = vehicle.follow(agent.flowField)
				vehicle.update()
				wrapped= vehicle.wrapAround()
				draw_with_vehicle= vehicle.draw(identifier > 0)
				if (!draw_with_vehicle){
					break
				}

			}
		}	
	});
	drawingAgents[drawingAgents.length -1]= filteredAgent
	setupNewAgent()
	path= []
	state= State.FLOW
}


function draw(){
	background(10,20,30);

	if (mouseIsPressed) {
		state= State.DRAWING
		path.push(createVector(mouseX,mouseY))	
	}
	else if(state === State.DRAWING && !mouseIsPressed){
		flow()
	}
	

	drawPath(path)
	for(let drawingAgent of drawingAgents.slice(0, -1)){ // Exclude the last element)
		Object.entries(drawingAgent).forEach(([key, agent]) => {
			for (let i = 0; i < agent.vehicles.length; i++) {
				const vehicle = agent.vehicles[i];
				const color = agent.vehicleColors[i]; // Assuming this array has the same length as vehicles
			
				// Use color[0], color[1], color[2] as r, g, b respectively
				vehicle.showTrail(color[0], color[1], color[2]);
			}
		});
	}
}
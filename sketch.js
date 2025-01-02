
let drawingAgents = {
	horizontal_lr: {
	  vehicles: [],     // Corresponds to vehicles_h1
	  flowField: null,
	  vehicleColors: [] 
	},
	horizontal_rl: {
	  vehicles: [],     // Corresponds to vehicles_h1
	  flowField: null,
	  vehicleColors: [] 
	},
	vertical_td: {
	  vehicles: [],     // Corresponds to vehicles_v1
	  flowField: null,
	  vehicleColors: [] 
	},
	vertical_dt: {
	  vehicles: [],     // Corresponds to vehicles_v1
	  flowField: null,
	  vehicleColors: [] 
	}
};
let filteredAgents= null
let numOfVehicles= 50
let path= []
let trackingIterations= 1000

const State = Object.freeze({
    DRAW: "DRAW",
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


function setup() {
	createCanvas(windowWidth, windowHeight); // Canvas covers the entire window

	for(let i = 0; i< numOfVehicles; i++){
		
		//Horizontals
		let y= i * (windowHeight/ numOfVehicles)
		let x= 10
		drawingAgents.horizontal_lr.vehicles.push(new Vehicle(x,y))

		//Horizontals
		y= i * (windowHeight/ numOfVehicles)
		x= windowWidth -10
		drawingAgents.horizontal_rl.vehicles.push(new Vehicle(x,y))

		//Verticals
		y= 10
		x= i * (windowWidth/ numOfVehicles)
		drawingAgents.vertical_td.vehicles.push(new Vehicle(x,y))

		//Verticals
		y= windowHeight -10
		x= i * (windowWidth/ numOfVehicles)
		drawingAgents.vertical_dt.vehicles.push(new Vehicle(x,y))
	}
	drawingAgents.horizontal_rl.flowField= new FlowField(20, InitType.HORIZONTAL_RL)
	drawingAgents.horizontal_lr.flowField= new FlowField(20, InitType.HORIZONTAL_LR)
	drawingAgents.vertical_td.flowField= new FlowField(20, InitType.VERTICAL_TD)
	drawingAgents.vertical_dt.flowField= new FlowField(20, InitType.VERTICAL_DT)
	
	background(20,50,70);
}
  
function windowResized() {
	resizeCanvas(windowWidth, windowHeight); // Adjust canvas size when window is resized
}

function keyPressed() {
    if (key === 'f') {
		let baseR = random(255);
		let baseG = random(255);
		let baseB = random(255);

		Object.entries(drawingAgents).forEach(([key, agent]) => {
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
		filteredAgents = filterDrawingAgents(drawingAgents, matchingAgents);
		Object.entries(filteredAgents).forEach(([key, agent]) => {
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
		state= State.FLOW
    }
}


function draw(){
	background(10,20,30);
	if (state === State.DRAW){
		drawPath(path)
	}

	if (mouseIsPressed && state === State.DRAW) {
		path.push(createVector(mouseX,mouseY))	
	}
	
	if (state === State.FLOW) {

		Object.entries(filteredAgents).forEach(([key, agent]) => {
			for (let i = 0; i < agent.vehicles.length; i++) {
				const vehicle = agent.vehicles[i];
				const color = agent.vehicleColors[i]; // Assuming this array has the same length as vehicles
			  
				// Use color[0], color[1], color[2] as r, g, b respectively
				vehicle.showTrail(color[0], color[1], color[2]);
			}
		});
	}
}
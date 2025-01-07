class DrawingAgent {
	constructor() {
	  this.horizontal_lr = new AgentGroup();
	  this.horizontal_rl = new AgentGroup();
	  this.vertical_td = new AgentGroup();
	  this.vertical_dt = new AgentGroup();
	}

	setVehicles(drawingParams){
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

	show(canvas= null){
		Object.entries(this).forEach(([key, agent]) => {
			for (let i = 0; i < agent.vehicles.length; i++) {
				const vehicle = agent.vehicles[i];
				const color = agent.vehicleColors[i]; // Assuming this array has the same length as vehicles
			
				// Use color[0], color[1], color[2] as r, g, b respectively
				vehicle.showTrail(color[0], color[1], color[2], canvas);
			}
		});
	}

	attractFieldToPath(path){
		Object.entries(this).forEach(([key, agent]) => {
			agent.flowField.attractToPath(path);
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

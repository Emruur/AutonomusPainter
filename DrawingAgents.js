class DrawingAgent {
	constructor(selfParams,path, baseColor) {
	  this.horizontal_lr = new AgentGroup(selfParams);
	  this.horizontal_rl = new AgentGroup(selfParams);
	  this.vertical_td = new AgentGroup(selfParams);
	  this.vertical_dt = new AgentGroup(selfParams);
	}


	setVehicles(){
		// Check if each group exists before initializing vehicles
		if (this.horizontal_lr) {
			this.horizontal_lr.vehicles = [];
			let params= this.horizontal_lr.params
			for (let i = 0; i < params.numOfVehicles; i++) {
				let y = i * (windowHeight / params.numOfVehicles);
				let x = 10;
				this.horizontal_lr.vehicles.push(new Vehicle(x, y, params));
			}
		}
	
		if (this.horizontal_rl) {
			this.horizontal_rl.vehicles = [];
			let params= this.horizontal_rl.params
			for (let i = 0; i < params.numOfVehicles; i++) {
				let y = i * (windowHeight / params.numOfVehicles);
				let x = windowWidth - 10;
				this.horizontal_rl.vehicles.push(new Vehicle(x, y, params));
			}
		}
	
		if (this.vertical_td) {
			this.vertical_td.vehicles = [];
			let params= this.vertical_td.params
			for (let i = 0; i < params.numOfVehicles; i++) {
				let y = 10;
				let x = i * (windowWidth / params.numOfVehicles);
				this.vertical_td.vehicles.push(new Vehicle(x, y, params));
			}
		}
	
		if (this.vertical_dt) {
			this.vertical_dt.vehicles = [];
			let params= this.vertical_dt.params
			for (let i = 0; i < params.numOfVehicles; i++) {
				let y = windowHeight - 10;
				let x = i * (windowWidth / params.numOfVehicles);
				this.vertical_dt.vehicles.push(new Vehicle(x, y, params));
			}
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
	constructor(selfParams,path, baseColor) {
	  this.vehicles = [];
	  this.flowField = null;
	  this.vehicleColors = [];
	  this.params= selfParams;
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


let vehicles= []
let flow_field
let numOfVehicles= 100

const State = Object.freeze({
    DRAW: "DRAW",
    FLOW: "FLOW",
});

let state= State.DRAW


function setup() {
	createCanvas(windowWidth, windowHeight); // Canvas covers the entire window
	vehicle= new Vehicle(windowWidth/2, windowHeight/2)

	for(let i = 0; i< numOfVehicles; i++){
		let offset_amount= windowHeight / 2
		let random_offset_x= getRandomInt(-offset_amount,offset_amount)
		let random_offset_y= getRandomInt(-offset_amount,offset_amount)
		let y_offset= i * (windowHeight/ numOfVehicles)
		let x= 10
		let y= y_offset

		vehicles.push(new Vehicle(x,y))
	}
	flow_field = new FlowField(20)
	background(20,50,70);
	flow_field.show()
}
  
function windowResized() {
	resizeCanvas(windowWidth, windowHeight); // Adjust canvas size when window is resized
}

function keyPressed() {
    if (key === 'f') {
		background(20,50,70);
		state= State.FLOW

		for(let vehicle of vehicles){
			draw_with_vehicle = true
			for(let i = 0; i< 1000 && draw_with_vehicle; i++){
				identifier = vehicle.follow(flow_field)
				vehicle.update()
				wrapped= vehicle.wrapAround()
				if (wrapped){
					break
				}

				draw_with_vehicle= vehicle.draw(identifier > 0)
			}
		}	
    }
}


function draw(){
	

	background(20,50,70);
	if (state === State.DRAW)
		flow_field.show()
	if (mouseIsPressed && state === State.DRAW) {
		
		target= createVector(mouseX,mouseY)
		flow_field.attractToPoint(target, 70)
	}
	
	if (state === State.FLOW){
		for(let vehicle of vehicles){
			vehicle.showTrail()
		}
	}
}
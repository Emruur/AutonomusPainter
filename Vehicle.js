class Vehicle {
    constructor(x, y) {
		this.position = createVector(x, y);
		this.velocity = createVector(0, 0);
		this.acceleration = createVector(0, 0);
		//{!1} Additional variable for size
		this.r = 10.0;
		//{!2} Arbitrary values for max speed and force; try varying these!
		this.maxspeed = 5;
		this.maxforce = 0.2;

        // Variable for stroke weight animation
        this.currentStrokeWeight = 0;
        this.maxStrokeWeight = 10;
        this.strokeActive = false;
        this.hasBeenActive = false;
		this.maxTrailLength= 50;
        this.trail = []; // Initialize trail in constructor
    }
  
    // Standard update function
    update() {
		this.velocity.add(this.acceleration);
		this.velocity.limit(this.maxspeed);
		this.position.add(this.velocity);
		this.acceleration.mult(0);
    }
    follow(flow) {
        // What is the vector at that spot in the flow field?
        let cell = flow.lookup(this.position);
		let desired = cell.vector;
		let identifier = cell.identifier;
        desired.setMag(this.maxspeed);
        //{!3} Steering is desired minus velocity.
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce);
        this.applyForce(steer);
		return identifier
    }

    wrapAround() {
		if (this.position.x > width) {
			this.position.x = 0;
			this.wrapped = true; // Mark as wrapped
		} else if (this.position.x < 0) {
			this.position.x = width;
			this.wrapped = true; // Mark as wrapped
		}
	
		if (this.position.y > height) {
			this.position.y = 0;
			this.wrapped = true; // Mark as wrapped
		} else if (this.position.y < 0) {
			this.position.y = height;
			this.wrapped = true; // Mark as wrapped
		}
		return this.wrapped
	}

    // Newton’s second law (skipping the math)
    applyForce(force) {
      	this.acceleration.add(force);
    }
  
    // The seek steering force algorithm
    seek(target) {
		let desired = p5.Vector.sub(target, this.position);
		desired.setMag(this.maxspeed);
		let steer = p5.Vector.sub(desired, this.velocity);
		steer.limit(this.maxforce);
		this.applyForce(steer);
    }

    arrive(target) {
        let desired = p5.Vector.sub(target, this.position);
        //{!1} The distance is the magnitude of
        // the vector pointing from
        // the position to the target.
        let d = desired.mag();
        //{!1} If we are closer than 100 pixels . . .
        if (d < 150) {
          //{!2} . . . set the magnitude according to how close we are.
          let m = map(d, 0, 100, 0, this.maxspeed);
          desired.setMag(m);
        } else {
          //{!1} Otherwise, proceed at maximum speed.
          desired.setMag(this.maxspeed);
        }
    
        //{!1} The usual steering = desired – velocity
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce);
        this.applyForce(steer);
    }
	showTrail(r,g,b){
		// Draw the trail
		stroke(r, g, b, 150); // Use alpha for transparency
		noFill();
		for (let i = 0; i < this.trail.length; i++) {
			const segment = this.trail[i];
			if (segment) {
				strokeWeight(segment.strokeWeight);
				beginShape();
				vertex(segment.position.x, segment.position.y);
				if (i + 1 < this.trail.length && this.trail[i + 1]) {
					vertex(this.trail[i + 1].position.x, this.trail[i + 1].position.y);
				}
				endShape();
			}
		}
	}
	isDeactivated(){
		return !this.strokeActive && this.hasBeenActive
	}
	draw(active) {
		// Handle activation state
		let maxTrailReached= (this.trail.length) >= this.maxTrailLength
		if (active) {
			this.strokeActive= !maxTrailReached
			this.hasBeenActive = true;
		} else if (this.hasBeenActive) {
			this.strokeActive = false;
		}
	
		// Gradually increase or decrease stroke weight
		if (this.strokeActive && this.currentStrokeWeight < this.maxStrokeWeight) {
			this.currentStrokeWeight += 0.1; // Adjust the increment for desired speed
		} else if (!this.strokeActive && this.currentStrokeWeight > 0) {
			this.currentStrokeWeight -= 0.1; // Adjust the decrement for desired speed
		}
		
		let strokeDead= this.currentStrokeWeight <= 0
		let notActivatedYet= !this.strokeActive && !this.hasBeenActive
		let strokeDeactivated= this.isDeactivated()
		
		

		// Skip drawing if stroke weight is 0 or if neither active nor in the process of dying out
		if (strokeDead || notActivatedYet) {
			if (strokeDeactivated || this.wrapped)
				return false;
			return true
		}
		if (strokeDeactivated){
			//return false;
		}
	
		// Add position to trail if not wrapped
		if (!this.wrapped) {
			this.trail.push({ position: this.position.copy(), strokeWeight: this.currentStrokeWeight });
		} else {
			this.trail.push(null); // Add a null marker to break the trail
		}
		return true
	}
	
	

}

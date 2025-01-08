let canvas; // Declare a global variable for the canvas
let bar
let isHoveringBar = false;

let drawingAgents= []
let path= []
let palettes;
let currColor;

let brushImages = {};
let placeholderImages = {};
function preload() {
    // Load palettes and brushes
    palettes = loadJSON('palettes.json', () => {
    }, (err) => {
        console.error('Error loading palettes:', err);
    });

	placeholderImages.viby = loadImage('assets/viby.png');
    placeholderImages.creative = loadImage('assets/creative.png');
    placeholderImages.precise = loadImage('assets/precise.png');

    brushes = loadJSON('brushes.json', () => {

        // Preload brush images
        Object.keys(brushes).forEach(category => {
            Object.keys(brushes[category]).forEach(brushName => {
                const imagePath = `brushes/${category}/${brushName}.png`; // Adjust path structure if necessary
                brushImages[brushName] = loadImage(imagePath, () => {
                }, (err) => {
                    console.error(`Error loading image for ${brushName}:`, err);
                });
            });
        });
    });
}


function getRandomColorFromPalettes(palettes) {
    const paletteNames = Object.keys(palettes);
    const randomPaletteName = random(paletteNames); // p5.js random
    const randomPalette = palettes[randomPaletteName];
    return random(randomPalette); // Random color from the selected palette
}


let drawingParams = {
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
	filteredOrientations: 3,
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
		for (let agent of drawingAgents){
			agent.setVehicles()
		}
		console.log("FINISHED")

	}
}

function isMousePressed() {
	if (!canvas || !canvas.elt || !bar) {
		console.error("Canvas or bar is not defined or invalid.");
		return false;
	}

	return mouseIsPressed && !isHoveringBar
}




function setupNewAgent(){
	let drawingAgent= new DrawingAgent(drawingParams)
	drawingAgent.setVehicles()
	drawingAgent.horizontal_rl.flowField= new FlowField(InitType.HORIZONTAL_RL, drawingParams)
	drawingAgent.horizontal_lr.flowField= new FlowField(InitType.HORIZONTAL_LR, drawingParams)
	drawingAgent.vertical_td.flowField= new FlowField(InitType.VERTICAL_TD, drawingParams)
	drawingAgent.vertical_dt.flowField= new FlowField(InitType.VERTICAL_DT, drawingParams)


	let baseColor;
	if (currColor== null)
		baseColor = random(selectedPalette); // Sample one base color from the selected palette
	else
		baseColor= currColor
	const perturbation = 40; // Neighborhood range for random sampling

	["horizontal_lr", "horizontal_rl", "vertical_td", "vertical_dt"].forEach((group) => {
		for (let vehicle of drawingAgent[group].vehicles) {
			let r = constrain(baseColor[0] + random(-perturbation, perturbation), 0, 255);
			let g = constrain(baseColor[1] + random(-perturbation, perturbation), 0, 255);
			let b = constrain(baseColor[2] + random(-perturbation, perturbation), 0, 255);
			drawingAgent[group].vehicleColors.push([r, g, b]);
		}
	});
	
	console.log(drawingAgent)
	drawingAgents.push(drawingAgent)
}


function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	background(20,50,70)
	// Sample a random palette once the sketch is loaded
	const paletteNames = Object.keys(palettes);
	const randomPaletteName = random(paletteNames); // Random palette from available palettes
	selectedPalette = palettes[randomPaletteName]; // Set the selected palette
	console.log(`Selected Palette: ${randomPaletteName}`, selectedPalette);

	//GUI Setup
	createColorBar();
	createBrushBar();

	bar = document.querySelector('.bar'); // Select the bar element

    // Add event listeners to track mouse hover on the bar
    bar.addEventListener('mouseenter', () => {
        isHoveringBar = true;
    });
    bar.addEventListener('mouseleave', () => {
        isHoveringBar = false;
    });
}
  
function windowResized() {
	resizeCanvas(windowWidth, windowHeight); // Adjust canvas size when window is resized
}

function drawWithAgent() {

    // Example agent and vehicle setup (replace with your actual data structure)
    let drawingAgent = drawingAgents[drawingAgents.length - 1];

    // Continue with the rest of your flow logic
    let prominentAngle = calculateProminentOrientation(path);
    let matchingAgents = new Set(determineClosestDirections(prominentAngle, drawingParams.filteredOrientations));
    let filteredAgent = filterDrawingAgent(drawingAgent, matchingAgents);


	drawingAgent.attractFieldToPath(path)
	for (let i = 0; i < drawingParams.trackingIterations; i++) {
		drawingAgent.flow()
	}

    // Update global state and reset for next iteration
    drawingAgents[drawingAgents.length - 1] = filteredAgent;
	console.log(drawingAgents[drawingAgents.length - 1])
    path = [];
}



function draw(){
	background(10,20,30);

	if (state !== State.FLOW){

		if (isMousePressed()) {
			console.log("DRAWING")
			state= State.DRAWING
			path.push(createVector(mouseX,mouseY))	
		}
		else if(state === State.DRAWING && !isMousePressed()){
			setupNewAgent()
			drawWithAgent()
			state= State.DRAW
		}

		drawPath(path)
		for(let drawingAgent of drawingAgents){ // Exclude the last element)
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


/// GUI
function createColorBar() {
	const colorBar = document.querySelector('.color-bar');
	colorBar.innerHTML = ''; // Clear existing buttons

	if (!selectedPalette || selectedPalette.length === 0) {
		console.error('No palette selected or palette is empty.');
		return;
	}

	selectedPalette.forEach((color) => {
		// Create a button for each color in the palette
		const button = document.createElement('button');
		button.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`; // Set button background color
		button.title = `RGB(${color[0]}, ${color[1]}, ${color[2]})`; // Tooltip for the color

		// Add an event listener to log the color when clicked
		button.addEventListener('click', () => {
			console.log(`Selected Color: rgb(${color[0]}, ${color[1]}, ${color[2]})`);
			currColor= color
		});

		// Append the button to the color bar
		colorBar.appendChild(button);
	});
}
function createBrushBar() {
    const brushBar = document.querySelector('.brush-bar');
    brushBar.innerHTML = ''; // Clear existing buttons

    // Check if placeholders are loaded
    if (!placeholderImages.viby || !placeholderImages.creative || !placeholderImages.precise) {
        console.error('Placeholder images are not loaded.');
        return;
    }

    // Brush categories and their corresponding placeholder images
    const categories = [
        { name: 'Creative', image: placeholderImages.creative, brushes: brushes.creative },
        { name: 'Viby', image: placeholderImages.viby, brushes: brushes.viby },
        { name: 'Precise', image: placeholderImages.precise, brushes: brushes.precise },
    ];

    // Iterate through categories to create buttons
    categories.forEach(category => {
        const brushNames = Object.keys(category.brushes);
        if (brushNames.length === 0) return;

        // Randomly select one brush from the category
        const randomBrushName = random(brushNames);
        const selectedBrushParams = category.brushes[randomBrushName];

        const button = document.createElement('button');
        button.style.backgroundImage = `url(${category.image.canvas.toDataURL()})`; // Use loaded image as background
        button.style.backgroundSize = 'cover'; // Ensure image covers the button
        button.style.backgroundPosition = 'center'; // Center the image
        button.style.border = '2px solid #555'; // Default border color
        button.style.borderRadius = '8px';
        button.style.cursor = 'pointer';
        button.style.transition = 'border-color 0.3s ease'; // Smooth transition for border color change
        button.style.width = '4rem'; // Adjust button size
        button.style.height = '3rem';
        button.style.margin = '10px'; // Add spacing between buttons

        // Add hover effect for border color
        button.addEventListener('mouseover', () => {
            button.style.borderColor = '#ff9800'; // Highlighted border color on hover
        });
        button.addEventListener('mouseout', () => {
            button.style.borderColor = '#555'; // Reset border color on mouse out
        });

        // Add click event listener to update drawingParams
        button.addEventListener('click', () => {
            drawingParams= selectedBrushParams
        });

        // Append the button to the brush bar
        brushBar.appendChild(button);
    });
}

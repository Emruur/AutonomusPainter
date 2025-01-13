//FIXME caching problem when loading
//FIXME SLow on chrome ok on safari
//TODO fraw after play
// Import brushes 


let projectData = {
    paths: [], // Array to store paths, base colors, and drawing parameters
    palette: null, // The latest palette in use
    brushes: {} // Selected brushes for each category (e.g., { viby: ..., creative: ..., precise: ... })
};

let canvas; // Declare a global variable for the canvas
let bar
let isHoveringBar = false;
let isModalOpen = false; // Tracks whether a modal is open

let drawingAgents= []
let path= []
let palettes;
let currColor;

let selectedBrushes= {
	creative: null,
	viby:null,
	precise: null
}

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

function flow(){
	state= State.FLOW
	for (let agent of drawingAgents){
		agent.setVehicles()
	}
}

function isMousePressed() {
    // Ignore mouse presses if a modal is open
    if (isModalOpen) {
        return false;
    }

    if (!canvas || !canvas.elt || !bar) {
        console.error("Canvas or bar is not defined or invalid.");
        return false;
    }

    return mouseIsPressed && !isHoveringBar && !isHoveringUIElement();
}


function setupNewAgent(existingColors = null){
	
	let drawingAgent= new DrawingAgent(drawingParams,path)
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
	
	
	drawingAgents.push(drawingAgent)

	projectData.paths.push({
		path: path.map((p) => ({ x: p.x, y: p.y })), // Convert vectors to plain {x, y} objects
		baseColor: baseColor, // Base color is an array and works fine as is
		params: { ...drawingParams } // Shallow clone of params (if it's just plain data)
	});
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
	// Choose a random brush from each category
    for (const [category, brushesInCategory] of Object.entries(brushes)) {
        const brushKeys = Object.keys(brushesInCategory); // Get all brush keys in this category
        const randomBrushKey = random(brushKeys); // Randomly pick one brush key
        selectedBrushes[category] = brushesInCategory[randomBrushKey]; // Save the random brush
    }
	drawingParams= selectedBrushes.viby


	const playButton = document.getElementById("play")
	playButton.addEventListener("click", flow)

	const downloadButton= document.getElementById("downloadButton")
	const uploadButton= document.getElementById("uploadButton")

	downloadButton.addEventListener("click", download)
	uploadButton.addEventListener("click", upload)
}

function drawWithAgent() {

    // Example agent and vehicle setup (replace with your actual data structure)
    let drawingAgent = drawingAgents[drawingAgents.length - 1];

    // // Calculate prominent angle for the path
    // let prominentAngle = calculateProminentOrientation(path);

    // // Get matching agents based on the prominent angle
    // let matchingAgents = new Set(determineClosestDirections(prominentAngle, drawingParams.filteredOrientations));


    // // Filter the drawing agent to retain only matching orientations
    // drawingAgent = filterDrawingAgent(drawingAgent, matchingAgents);

	drawingAgent.attractFieldToPath(path)
	for (let i = 0; i < drawingParams.trackingIterations; i++) {
		drawingAgent.flow()
	}

    path = [];
}


function draw(){
	background(10,20,30);

	if (state !== State.FLOW){
		if (isMousePressed()) {
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

	if (state === State.FLOW) {

        // Run the flow logic for all agents
        for (let agent of drawingAgents) {
            agent.flow();
            agent.show();
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

    if (!placeholderImages.viby || !placeholderImages.creative || !placeholderImages.precise) {
        console.error('Placeholder images are not loaded.');
        return;
    }

    // Brush categories and their corresponding placeholder images
    const categories = [
        { name: 'creative', image: placeholderImages.creative },
        { name: 'viby', image: placeholderImages.viby },
        { name: 'precise', image: placeholderImages.precise },
    ];

    categories.forEach(category => {
        // Create a button for each category
        const button = document.createElement('button');
        button.style.backgroundImage = `url(${category.image.canvas.toDataURL()})`; // Use placeholder image
        button.style.backgroundSize = 'cover';
        button.style.backgroundPosition = 'center';
        button.style.border = '2px solid #555';
        button.style.borderRadius = '8px';
        button.style.cursor = 'pointer';
        button.style.width = '4rem';
        button.style.height = '3rem';
        button.style.margin = '10px';

        // Add hover effect for border color
        button.addEventListener('mouseover', () => {
            button.style.borderColor = '#ff9800';
        });
        button.addEventListener('mouseout', () => {
            button.style.borderColor = '#555';
        });

        // Add click event listener to toggle the selected brush from the modal
        button.addEventListener('click', () => {
            drawingParams= selectedBrushes[category.name]
			console.log(category.name)
        });

        // Append the button to the brush bar
        brushBar.appendChild(button);
    });
}


document.addEventListener("DOMContentLoaded", () => {
	const openModalButton = document.getElementById("openPaletteModal");
	const modal = document.getElementById("paletteModal");
	const closeModalButton = modal.querySelector(".close");
	const paletteContainer = modal.querySelector(".palette-container");

	openModalButton.addEventListener("click", () => {
		modal.style.display = "flex";
		populatePalettes();
	});

	closeModalButton.addEventListener("click", () => {
		modal.style.display = "none";
	});

	window.addEventListener("click", (e) => {
		if (e.target === modal) {
			modal.style.display = "none";
		}
	});

	function populatePalettes() {
		paletteContainer.innerHTML = ""; // Clear existing palettes
		const paletteNames = Object.keys(palettes);

		paletteNames.forEach((paletteName) => {
			const colors = palettes[paletteName];
			const paletteDiv = document.createElement("div");
			paletteDiv.className = "palette";
			paletteDiv.title = paletteName;

			// Create sectors for each color
			const sectors = colors.length;
			colors.forEach((color, index) => {
				const sector = document.createElement("div");
				const angle = 360 / sectors;
				sector.style = `
					position: absolute;
					width: 50%;
					height: 50%;
					background-color: rgb(${color.join(",")});
					clip-path: polygon(0 0, 100% 0, 50% 50%);
					transform-origin: 100% 100%;
					transform: rotate(${angle * index}deg);
				`;
				paletteDiv.appendChild(sector);
			});

			paletteDiv.addEventListener("click", () => {
				selectedPalette = colors;
				currColor = null; // Reset current color
				createColorBar();
				modal.style.display = "none";
			});

			paletteContainer.appendChild(paletteDiv);
		});
	}
});
function closeBrushModal() {
    const brushModal = document.getElementById("brushModal");
    if (brushModal) {
        brushModal.style.display = "none";
    }
}
function renderBrushList(category) {
    // Find the category div dynamically by searching for its title
    const categoryDiv = Array.from(document.querySelectorAll(".brush-category")).find((div) => {
        const title = div.querySelector("h3");
        return title && title.textContent === category;
    });

    if (!categoryDiv) {
        console.error(`Category div not found for category: ${category}`);
        return;
    }

    // Find the brush-list within the located category div
    let brushList = categoryDiv.querySelector(".brush-list");
    if (!brushList) {
        // If the brush-list doesn't exist, create it
        brushList = document.createElement("div");
        brushList.className = "brush-list";
        categoryDiv.appendChild(brushList);
    } else {
        // Clear existing brush list
        brushList.innerHTML = "";
    }

    // Populate the brush list with buttons for each brush
    Object.keys(brushes[category]).forEach((brushName) => {
        const brushButton = document.createElement("button");
        brushButton.textContent = brushName; // Use brush name as button text
        brushButton.className = "brush-button";

        // Add an image preview (if available)
        if (brushImages[brushName]) {
            brushButton.style.backgroundImage = `url(${brushImages[brushName].canvas.toDataURL()})`;
            brushButton.style.backgroundSize = "cover";
        }

        // On brush selection
        brushButton.addEventListener("click", () => {
            drawingParams = brushes[category][brushName]; // Update drawing parameters
            selectedBrushes[category] = brushes[category][brushName];
            brushModal.style.display = "none"; // Close modal
            console.log(`Selected brush: ${brushName} in category: ${category}`);
        });

        // Append the button to the brush list
        brushList.appendChild(brushButton);
    });
}
function createImportButton(category) {
    const importButton = document.createElement("button");
    importButton.className = "import-button";
    importButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-upload" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z"/>
        </svg> Import
    `;

    importButton.addEventListener("click", () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "application/json";

        // Add to DOM temporarily (required for some browsers)
        document.body.appendChild(fileInput);

        // Add event listener
        fileInput.addEventListener("change", async () => {
            console.log("File input triggered");
            const file = fileInput.files[0];
            if (!file) return;

            try {
                // Read and parse the file content
                const fileContent = await file.text();
                const importedParams = JSON.parse(fileContent);

                // Validate the structure of the imported file
                const requiredKeys = [
                    "numOfVehicles",
                    "trackingIterations",
                    "flowFieldResolution",
                    "attractionRadius",
                    "maxVehicleForce",
                    "maxVehicleSpeed",
                    "maxVehicleStroke",
                    "maxVehicleTrailLength",
                    "vehicleStrokeUp",
                    "vehicleStrokeDecay",
                    "filteredOrientations",
                ];

                const isValid = requiredKeys.every((key) => key in importedParams);

                if (!isValid) {
                    alert("Invalid JSON file structure. Please provide a valid drawingParams object.");
                    return;
                }

                // Add the imported brush to the specified category
                const brushName = `ImportedBrush-${Date.now()}`;
                brushes[category][brushName] = importedParams;

                // Refresh the modal to reflect the new brush
                renderBrushList(category)
            } catch (error) {
                console.error("Error importing brush:", error);
                alert("Failed to import brush. Please check the file format.");
            } finally {
                // Remove the input element after use
                document.body.removeChild(fileInput);
            }
        });

        // Trigger the file picker
        fileInput.click();
    });

    return importButton;
}
function addCategoryButtons(categoryDiv, category) {
    const buttonGroup = document.createElement("div");
    buttonGroup.className = "button-group";

    // Create the "Add" button
    const addButton = document.createElement("button");
    addButton.className = "add-button";
    addButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg> Add
    `;
    addButton.addEventListener("click", () => {
        document.getElementById("brushCreationModal").style.display = "flex";
        document.getElementById("brushModal").style.display= "none"
    });


    // Create and append the import button
    const importButton = createImportButton(category);

    buttonGroup.appendChild(addButton);
    buttonGroup.appendChild(importButton);
    categoryDiv.appendChild(buttonGroup);
}

function setBrushes(){
    const openBrushModalButton = document.getElementById("openBrushModal");
    const brushModal = document.getElementById("brushModal");
    const closeBrushModalButton = brushModal.querySelector(".close");
    const brushContainer = document.getElementById("brushContainer");

    // Open Brush Modal
    openBrushModalButton.addEventListener("click", () => {
        brushModal.style.display = "flex";
        populateBrushes();
    });

    // Close Brush Modal
    closeBrushModalButton.addEventListener("click", () => {
        brushModal.style.display = "none";
    });

    // Close modal when clicking outside of it
    window.addEventListener("click", (e) => {
        if (e.target === brushModal) {
            brushModal.style.display = "none";
        }
    });

    // Populate Brushes
    
    function populateBrushes() {
		const brushContainer = document.getElementById("brushContainer");
		const spinner = document.getElementById("spinner");
	
		// Show spinner and hide brush container initially
		spinner.style.display = "block";
		brushContainer.style.display = "none";
	
		// Simulate loading process
		setTimeout(() => {
			brushContainer.innerHTML = ""; // Clear existing brushes
	
			// Loop through brush categories
			Object.keys(brushes).forEach((category) => {
				const categoryDiv = document.createElement("div");
				categoryDiv.className = "brush-category";
	
				// Category Title
                const horDiv = document.createElement("div");

                // Apply flex styles
                horDiv.style.display = "flex";
                horDiv.style.justifyContent = "center"; // Center items horizontally
                horDiv.style.alignItems = "center"; // Center items vertically
                horDiv.style.flexDirection = "row"; // Default; ensures horizontal layout
                horDiv.style.gap = "10px"; // Optional: Adds spacing between elements

				const title = document.createElement("h3");
				title.textContent = category;
				title.className= "white";
				horDiv.appendChild(title);

                addCategoryButtons(horDiv, category);

                categoryDiv.appendChild(horDiv)
	
				// Brushes for the category
				const brushList = document.createElement("div");
				brushList.className = "brush-list";
	
				Object.keys(brushes[category]).forEach((brushName) => {
					const brushButton = document.createElement("button");
					brushButton.textContent = brushName; // Use brush name as button text
					brushButton.className = "brush-button";
	
					// Add an image preview (if available)
					if (brushImages[brushName]) {
						brushButton.style.backgroundImage = `url(${brushImages[brushName].canvas.toDataURL()})`;
						brushButton.style.backgroundSize = "cover";
					}
	
					// On brush selection
					brushButton.addEventListener("click", () => {
						drawingParams = brushes[category][brushName]; // Update drawing parameters
						selectedBrushes[category]= brushes[category][brushName];

						brushModal.style.display = "none"; // Close modal
					});
	
					brushList.appendChild(brushButton);
				});
	
				categoryDiv.appendChild(brushList);
				brushContainer.appendChild(categoryDiv);
			});
	
			// Hide spinner and show brush container
			spinner.style.display = "none";
			brushContainer.style.display = "block";
		}, 100); // Adjust the timeout as needed (or remove it for real-time loading)

	}

}
document.addEventListener("DOMContentLoaded", () => {
    setBrushes()
});



function download() {

	projectData.palette = selectedPalette; // Save the current palette
    projectData.brushes = { ...selectedBrushes }; // Save the selected brushes

    // Prepare the JSON object
    const dataStr = JSON.stringify(projectData, null, 2); // Pretty-print JSON
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create a temporary download link
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "project.json";
    downloadLink.click();

    // Revoke the object URL to free memory
    URL.revokeObjectURL(url);
    console.log("Project downloaded successfully!");
}

function upload() {
    // Create a file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    // Handle file selection
    input.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Read the file as text
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // Parse the JSON and update `projectData`
                const uploadedData = JSON.parse(e.target.result);
                projectData = uploadedData;

                // Recreate the drawing agents and paths from the uploaded data
                recreateFromProjectData();
                console.log("Project uploaded successfully!");
            } catch (err) {
                console.error("Error parsing the uploaded file:", err);
            }
        };
        reader.readAsText(file);
    });

    // Simulate a click on the file input to open the file picker
    input.click();
}

function recreateFromProjectData() {
    // Clear the existing drawing agents
    drawingAgents = [];
	currColor= null;

    // Restore the palette
    if (projectData.palette) {
        selectedPalette = projectData.palette;
        createColorBar(); // Update the color bar with the restored palette
        currColor = null; // Reset current color
    }

    // Restore the brushes
    if (projectData.brushes) {
        selectedBrushes = { ...projectData.brushes };
        drawingParams = selectedBrushes.viby; // Default to the "viby" brush
        console.log("Brushes restored:", selectedBrushes);
    }

	

    // Recreate the paths, base colors, and parameters
    projectData.paths.forEach((pathData) => {
        path = pathData.path.map((p) => createVector(p.x, p.y)); // Convert plain objects back to vectors
        currColor = pathData.baseColor; // Set the base color
        drawingParams = pathData.params; // Set the drawing parameters

        // Create a new agent with the data
        setupNewAgent();
        drawWithAgent();
    });

    // Reset the path and current color
    path = [];
    currColor = null;
	state= State.DRAW
}

document.addEventListener("DOMContentLoaded", () => {
    const introModal = document.getElementById("introModal");
    const closeModalButton = introModal.querySelector(".close");
    const pages = Array.from(document.querySelectorAll(".page"));
    const prevPageButton = document.getElementById("prevPage");
    const nextPageButton = document.getElementById("nextPage");

    let currentPageIndex = 0;

    function updatePagination() {
        pages.forEach((page, index) => {
            page.style.display = index === currentPageIndex ? "block" : "none";
        });
        prevPageButton.disabled = currentPageIndex === 0;
        nextPageButton.disabled = currentPageIndex === pages.length - 1;
    }

    prevPageButton.addEventListener("click", () => {
        if (currentPageIndex > 0) {
            currentPageIndex--;
            updatePagination();
        }
    });

    nextPageButton.addEventListener("click", () => {
        if (currentPageIndex < pages.length - 1) {
            currentPageIndex++;
            updatePagination();
        }
    });

    closeModalButton.addEventListener("click", () => {
        introModal.style.display = "none";
    });

    updatePagination(); // Show the first page
});

document.addEventListener("DOMContentLoaded", () => {
    const introModal = document.getElementById("introModal");
    const closeModalButton = introModal.querySelector(".close");

    // Open the modal and set isModalOpen to true
    function openIntroModal() {
        introModal.style.display = "flex";
        isModalOpen = true;
    }

    // Close the modal and set isModalOpen to false
    closeModalButton.addEventListener("click", () => {
        introModal.style.display = "none";
        isModalOpen = false;
    });

    // Example: Open the modal on page load
    openIntroModal();
});

function setupBrushCreationModal() {


    const closeBrushCreationModal = brushCreationModal.querySelector(".close");

    // Close the modal when clicking the close button
    closeBrushCreationModal.addEventListener("click", () => {
        brushCreationModal.style.display = "none";
    });

    // Close the modal when clicking outside the modal content
    window.addEventListener("click", (event) => {
        if (event.target === brushCreationModal) {
            brushCreationModal.style.display = "none";
        }
    });
}

document.addEventListener("DOMContentLoaded", setupBrushCreationModal);
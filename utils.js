function getRandomInt(min, max) {
    // Ensure min and max are integers
    min = Math.ceil(min);
    max = Math.floor(max);
    // Generate random integer between min (inclusive) and max (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const InitType = Object.freeze({
    PERLIN: "PERLIN",
    RANDOM: "RANDOM",
    HORIZONTAL_LR: "HORIZONTAL_LR",
    HORIZONTAL_RL: "HORIZONTAL_RL",
    VERTICAL_TD: "VERTICAL_TD",
    VERTICAL_DT: "VERTICAL_DT",
    CUSTOM: "CUSTOM"
});

function calculateProminentOrientation(trail) {
    if (trail.length < 2) {
      return  0
    }
  
    // Initialize a vector to store the cumulative direction
    let cumulativeDirection = createVector(0, 0);
  
    // Iterate through the trail and sum up the direction vectors
    for (let i = 0; i < trail.length - 1; i++) {
      let segmentDirection = p5.Vector.sub(trail[i + 1], trail[i]);
      cumulativeDirection.add(segmentDirection);
    }
  
    // Normalize the cumulative direction vector to find the average
    cumulativeDirection.normalize();
  
    // Calculate the prominent angle in degrees
    let prominentAngle = degrees(cumulativeDirection.heading());
  
    return prominentAngle;
}
  

function determineClosestDirections(angle, numFilters) {
  // Normalize the angle to the range [0, 360)
  angle = (angle % 360 + 360) % 360;

  // Define the cardinal directions and their representative angles
  const directions = {
    horizontal_lr: 0,  // Rightward (0°)
    horizontal_rl: 180, // Leftward (180°)
    vertical_td: 90,   // Downward (90°)
    vertical_dt: 270   // Upward (270°)
  };

  // Calculate the absolute difference between the input angle and each direction
  let differences = Object.entries(directions).map(([key, dirAngle]) => {
    let diff = Math.abs(angle - dirAngle);
    diff = Math.min(diff, 360 - diff); // Handle circular angle wrap-around
    return { key, diff };
  });

  // Sort by the smallest angular difference
  differences.sort((a, b) => a.diff - b.diff);

  // Limit the number of results to numFilters
  numFilters = Math.min(Math.max(numFilters, 1), differences.length); // Clamp numFilters between 1 and available directions

  // Return the top numFilters closest directions
  return differences.slice(0, numFilters).map(diff => diff.key);
}

  

function filterDrawingAgent(drawingAgents, allowedKeys) {
    // Filter only the keys specified in allowedKeys
    for (let key of Object.keys(drawingAgents)) {
        if (!allowedKeys.has(key)) {
            delete drawingAgents[key];
        }
    }
    // Return the modified drawingAgents (methods are untouched because they are on the prototype)
    return drawingAgents;
}


function isHoveringUIElement() {
  // Check if the mouse is over a UI element by examining `document.activeElement`
  return document.activeElement.tagName === "INPUT" || isHoveringBar;
}
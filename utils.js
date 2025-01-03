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
      throw new Error("Trail must have at least two points to calculate orientation.");
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
  

function determineClosestDirections(angle) {
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
  
    // Return the two closest directions
    return new Set([differences[0].key, differences[1].key]);
}
  

function filterDrawingAgent(drawingAgents, allowedKeys) {
    // Create a new object with only the allowed keys
    let filteredAgents = {};
    for (let key of Object.keys(drawingAgents)) {
      if (allowedKeys.has(key)) {
        filteredAgents[key] = drawingAgents[key];
      }
    }
    return filteredAgents;
  }
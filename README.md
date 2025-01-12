# Creative Brushes

Creative brushes will allow you to direct autonomous drawing agents to draw creative sketches.  
The drawing agents act as interesting and non-predictable brushes that will steer you in the right creative direction.  
This system draws inspiration from natural dynamic drawing mediums that add their own touch to the artwork, such as watercolors and Turkish marbling art (Ebru).

<div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px;">
    <img src="assets/sulu.jpeg" alt="Watercolor Example" style="width: 250px; height: auto; border: 2px solid #ddd; border-radius: 5px;">
    <img src="assets/ebru.jpeg" alt="Ebru Example" style="width: 250px; height: auto; border: 2px solid #ddd; border-radius: 5px;">
    <img src="assets/demo.gif" alt="Drawing Agent Demo" style="width: 250px; height: auto; border: 2px solid #ddd; border-radius: 5px;">
</div>

## Autonomus Agents

TODO https://natureofcode.com/autonomous-agents/

### Parameters of the agents
- max velocity?
- max speed?
...

ALPER


## Flow Field Following

GOKALP
TODO
https://natureofcode.com/autonomous-agents/#flow-fields

### Parameters of the flow field?
- resolution
- direction
    - using 4 flow fields with different directions

## Modifying the flow field

To direct the agents path we can alter the flow field. To do that we define a radius and attract the the vectors within that radius to the mouse location. With this method we can essentially draw on a path on the flow field and the agents that come accross our path will follow it. 

TODO

FlowField.js/attractToPath
### Parameters of modificaion
- attraction radius

## Other drawing parameters

EMRE

- tracking iterations

### Drawing while on the field
- stroke up / down
- max trail length

## How to find good parameters that draw good

EMRE

### Define reasonable ranges for each parameter

| Parameter                | Min  | Max  | Step  |
|--------------------------|------|------|-------|
| numOfVehicles            | 1    | 300  | 1     |
| trackingIterations       | 100  | 1500 | 50    |
| flowFieldResolution      | 4    | 200  | 1     |
| attractionRadius         | 5    | 100  | 5     |
| maxVehicleForce          | 0.2  | 5    | 0.1   |
| maxVehicleSpeed          | 1    | 10   | 0.5   |
| maxVehicleStroke         | 1    | 10   | 0.5   |
| maxVehicleTrailLength    | 10   | 200  | 10    |
| vehicleStrokeUp          | 0.1  | 1    | 0.1   |
| vehicleStrokeDecay       | 0.1  | 1    | 0.1   |
| filteredOrientations     | 1    | 4    | 1     |

### Evolutionary Search
search.js - search.html

GOKALP

### Modifying the parameters manually
tune.js tune.html

ALPER

## Dealing with Color

EMRE







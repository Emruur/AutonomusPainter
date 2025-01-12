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
### Flow Fields

Flow fields are that store directions. In our 2d case it is a 2d matrix that stores 2d vectors.

![](reportAssets/flowFields.png)

We can make our agents follow this flow fields rather than seeking a target as explained previously. To do that we query the flow field to obtain the corresponding vector to be followed depending on the agents curent position. Than we set the agents desired vector with the vector that is returned by the flow field.

![](reportAssets/FFfollow.gif)

A parameter of a flow field is its resolution. We can have a flow field that has a vector for each pixel in the canvas but its often computationally unfeasible, thus lower resolution flow fiewlds are often used in practice where the canvas is divided into a grid of pixels and each cell of pixels have a common direction vector.

The resolution of the flow field is a major parameter to alter the drawing behaviour, thus we will have a *flowFieldResolution* drawing parameter.

https://natureofcode.com/autonomous-agents/#flow-fields

## Modifying the flow field

To direct the agents path we can alter the flow field. To do that we define a radius and attract the the vectors within that radius to the mouse location. With this method we can essentially draw on a path on the flow field and the agents that come accross our path will follow it.  However a problem with this method is that at the end of the path a black hole forms where every vector within that radius points to the center and any agent that come accross the black hole gets stuck. To solve this issue we take the mouse location of the previous timestep and extrapolate the position of the next mouse location such that it falls on the rim of the attraction circle.

**Equation for the Attract Point**
$$
\mathbf{futureTarget} = \mathbf{target\_pos} + \mathbf{velocity}
$$

Where:

- $\mathbf{velocity} = \mathbf{target\_pos} - \mathbf{previousTarget}$
- $\|\mathbf{velocity}\| = \text{radius\_pixel}$ (scaled to match the radius)


<div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px; margin-bottom: 20px;">
    <img src="reportAssets/drawFF.gif" alt="Watercolor Example" style="width: 250px; height: auto; border: 2px solid #ddd; border-radius: 5px;">
    <img src="reportAssets/flowFF.gif" alt="Ebru Example" style="width: 250px; height: auto; border: 2px solid #ddd; border-radius: 5px;">
</div>


Note that the agents start drawing once they enter the attraction radius of the path and they gradually increase their stroke once they enter the radius and decrease their stroke once they leave the attraction radius for a smooth effect.  

This process in total gives us three drawing parameters that can be modified to alter the drawing behaviour.

- AttractionRadius
- StrokeUp
- StrokeDown

### Multiple Flow Fields

When the drawn path directs towards the flow field we get sub-optimal drawing performance from agents. To owecome this issue we 4 flow fields in 4 directions(left to right, top to bottom and etc) and let 4 sets of agent groups track these fields. As a result more coherent drawings for different angled paths are obtained.

![a](reportAssets/4flowFF.gif)




## How to find good parameters that draw good

So far a dozen parameters that alter the end drawing drastically have mentioned. These parameters have weird interactions with each other and often yield unexpected results. To find a good configuration we set reasonable ranges for each parameter and used two methods to find the configurations we liked, manual configuration and evolutionary search.

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

## Results

EMRE








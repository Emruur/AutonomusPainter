const InitType = Object.freeze({
    PERLIN: "PERLIN",
    RANDOM: "RANDOM",
    HORIZONTAL: "HORIZONTAL",
});

class FlowField {
    constructor(r) {
        this.resolution = r;
        this.cols = Math.floor(width / this.resolution);
        this.rows = Math.floor(height / this.resolution);
        this.field = new Array(this.cols);
        for (let i = 0; i < this.cols; i++) {
            this.field[i] = new Array(this.rows);
        }
        this.init();

        this.previousTarget = null; // To store the previous target position (v0)
    }

    init(init_type = InitType.HORIZONTAL) {
        noiseSeed(random(10000));
        let xoff = 0;
        for (let i = 0; i < this.cols; i++) {
            let yoff = 0;
            for (let j = 0; j < this.rows; j++) {
                let angle;
                if (init_type === InitType.PERLIN) {
                    angle = map(noise(xoff, yoff), 0, 1, 0, TWO_PI);
                } else if (init_type === InitType.RANDOM) {
                    angle = getRandomInt(0, 360);
                } else {
                    angle = 0;
                }
                let vector = p5.Vector.fromAngle(angle);
                vector.setMag(0.3);
                this.field[i][j] = { vector: vector, identifier: 0 };
                yoff += 0.1;
            }
            xoff += 0.1;
        }
    }

    resetPointAttraction() {
        this.previousTarget = null;
    }

    show() {
        stroke(0, 100); // Set the stroke color and make it slightly transparent
        fill(0, 150); // Fill for the arrowhead
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                let x = i * this.resolution;
                let y = j * this.resolution;
                let { vector } = this.field[i][j];
                let arrowLength = vector.mag() * this.resolution;

                push();
                translate(x, y);
                rotate(vector.heading());
                line(0, 0, arrowLength, 0);
                let arrowSize = this.resolution / 8;
                translate(arrowLength, 0);
                triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
                pop();
            }
        }
    }

    lookup(position) {
        let column = constrain(
            floor(position.x / this.resolution),
            0,
            this.cols - 1
        );
        let row = constrain(floor(position.y / this.resolution), 0, this.rows - 1);
        return {
            vector: this.field[column][row].vector.copy(),
            identifier: this.field[column][row].identifier
        };
    }

    attractToPoint(target_pos, radius_pixel = 100, identity = 1) {
        if (this.previousTarget === null) {
            this.previousTarget = target_pos.copy();
            return;
        }

        let velocity = p5.Vector.sub(target_pos, this.previousTarget);

        // Avoid attracting if velocity is zero
        if (velocity.mag() === 0) {
            this.previousTarget = target_pos.copy();
            return;
        }

        // Scale the velocity to match the radius
        velocity.setMag(radius_pixel);

        // Calculate the extrapolated point at the ring
        let futureTarget = p5.Vector.add(target_pos, velocity);

        let column = constrain(floor(target_pos.x / this.resolution), 0, this.cols - 1);
        let row = constrain(floor(target_pos.y / this.resolution), 0, this.rows - 1);

        let radius_grid = Math.floor(radius_pixel / this.resolution);

        for (let i = column - radius_grid; i <= column + radius_grid; i++) {
            for (let j = row - radius_grid; j <= row + radius_grid; j++) {
                let x_grid_displacement = i - column;
                let y_grid_displacement = j - row;
                let distance_grid = Math.sqrt(x_grid_displacement ** 2 + y_grid_displacement ** 2);

                const isWithinRadius = distance_grid <= radius_grid;
                const isWithinCols = i >= 0 && i < this.cols;
                const isWithinRows = j >= 0 && j < this.rows;

                if (isWithinRadius && isWithinCols && isWithinRows) {
                    let x_pixel = i * this.resolution;
                    let y_pixel = j * this.resolution;
                    let currentPosition = createVector(x_pixel, y_pixel);
                    let displacement = p5.Vector.sub(futureTarget, currentPosition);

                    this.field[i][j].vector.setHeading(displacement.heading());
                    this.field[i][j].identifier = identity;
                }
            }
        }

        this.previousTarget = target_pos.copy();
    }
}

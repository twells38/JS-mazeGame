//destructuring form to get access enging, render, runner, world, bodies. that all come from Matter
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 10;
const cellsVertical = 10;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

//boiler plate
//create a new engine
const engine = Engine.create();
engine.world.gravity.y = 0; // disabling gravity
//when we create the engine we get the world come along with it
const { world } = engine;
//show some content on the screen
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false, // it will show solid shapes besides outlines and random colors
    width,
    height
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);
//click and drag functionality
/*World.add(
  world,
  MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas)
  })
); */
/*create shape
const shape = Bodies.rectangle(200, 200, 50, 50, {
  isStatic: true
});
// pass world and shape  to World
World.add(world, shape); */

// create wall frame
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
];

World.add(world, walls);
/*random shapes
for (let i = 0; i < 20; i++) {
  if (Math.random() > 0.5) {
    World.add(
      world,
      Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50)
    );
  } else {
    World.add(
      world,
      Bodies.circle(Math.random() * width, Math.random() * height, 35, {
        render: {
          fillStyle: "red"
        }
      })
    );
  }
}*/

// Maze generation 3 rows and 3 columns

/* version 1 but not a good way to do
const grid = [];
for (let i = 0; i < 3; i++) {
  grid.push([]);
  for (let j = 0; j < 3; j++) {
    grid[i].push(false);
  }
}
console.log(grid);
*/
const shuffle = arr => {
  let counter = arr.length;
  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;
    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};
//version 2
const grid = Array(cellsVertical) //number of row
  .fill(null)
  // map statement will run over inner array
  .map(() => Array(cellsHorizontal).fill(false)); //number of column

const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

//random starting cells
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
  // If i have visted the cell at [row, column], then return
  if (grid[row][column]) {
    return;
  }

  // Mark this cell as being visited
  grid[row][column] = true;

  //Assemble randomly-ordered list  of neighbor

  const neighbors = shuffle([
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"]
  ]);
  //for each neighbor..console..
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;
    //see if theat neighbor is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      continue;
    }
    //if we have visited that neighbor continue to next neighnor
    if (grid[nextRow][nextColumn]) {
      continue;
    }
    //remove a wall from either horizontals or verticals
    if (direction === "left") {
      verticals[row][column - 1] = true;
    } else if (direction === "right") {
      verticals[row][column] = true;
    } else if (direction === "up") {
      horizontals[row - 1][column] = true;
    } else if (direction === "down") {
      horizontals[row][column] = true;
    }
    stepThroughCell(nextRow, nextColumn);
  }
};
stepThroughCell(startRow, startColumn);
//console.log(grid);

//iterate over horizontals using forEach statement
//horizontals is 2 d array..false is wall, true is no wall
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      5,
      {
        label: "wall", //to easy to figure it out what type of shapes it represent
        isStatic: true,
        render: {
          fillStyle: "red"
        }
      }
    );
    World.add(world, wall);
  });
});

//creat vertical wall secment

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      5,
      unitLengthY,
      {
        label: "wall",
        isStatic: true,
        render: {
          fillStyle: "red"
        }
      }
    );
    World.add(world, wall);
  });
});

//create goal
const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7,
  unitLengthY * 0.7,
  {
    label: "goal",
    isStatic: true,
    render: {
      fillStyle: "green"
    }
  }
);
World.add(world, goal);

//create balls
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
  label: "ball",
  render: {
    fillStyle: "blue"
  }
});
World.add(world, ball);

// handling keypress
document.addEventListener("keydown", event => {
  const { x, y } = ball.velocity; //adding keyboard control

  if (event.key === "w" || event.key === "ArrowUp") {
    Body.setVelocity(ball, { x, y: y - 5 });
  }

  if (event.key === "d" || event.key === "ArrowRight") {
    Body.setVelocity(ball, { x: x + 5, y });
  }

  if (event.key === "s" || event.key === "ArrowDown") {
    Body.setVelocity(ball, { x, y: y + 5 });
  }

  if (event.key === "a" || event.key === "ArrowLeft") {
    Body.setVelocity(ball, { x: x - 5, y });
  }
});

//win condition
Events.on(engine, "collisionStart", event => {
  event.pairs.forEach(collision => {
    const labels = ["ball", "goal"];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector(".winner").classList.remove("hidden");
      world.gravity.y = 1;
      world.bodies.forEach(body => {
        if (body.label === "wall") {
          Body.setStatic(body, false); //setting to false after already true removes body
        }
      });
    }
  });
});

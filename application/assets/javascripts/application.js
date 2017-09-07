/**
 * Main Application File
 *
 * Use for bootstrapping large application
 * or just fill it with JS on small projects
 *
 */
//import * as PIXI from 'pixi.js';

var Container = PIXI.Container,
  autoDetectRenderer = PIXI.autoDetectRenderer,
  loader = PIXI.loader,
  resources = PIXI.loader.resources,
  TextureCache = PIXI.utils.TextureCache,
  Texture = PIXI.Texture,
  Text = PIXI.Text,
  Sprite = PIXI.Sprite;

//Create the renderer
var renderer = autoDetectRenderer(512, 512);
//renderer.view.style.position = "absolute";
//renderer.view.style.display = "block";
//renderer.autoResize = true;
//renderer.resize(window.innerWidth, window.innerHeight);
var stage = new Container();

//Add the canvas to the HTML document
  document.body.appendChild(renderer.view);

//Create a container object called the `stage`
loader
  .add('sprites', "documents/treasureHunter.json")
  .load(setup);


//Define variables that might be used in more
//than one function
var state = () => {}, dungeon, explorer, treasure, door, id, blobs = [], message;

function setup() {

  id = PIXI.loader.resources.sprites.textures;

  dungeon = new Sprite(id['dungeon.png']);
  stage.addChild(dungeon);

  explorer = new Sprite(id['explorer.png']);
  explorer.x = 48;
  explorer.y = renderer.screen.height / 2 - explorer.height / 2;
  explorer.vx = 0;
  explorer.vy = 0;
  stage.addChild(explorer);

  //Make the treasure box using the alias
  treasure = new Sprite(id["treasure.png"]);
  treasure.x = renderer.screen.width - treasure.width - 48;
  treasure.y = renderer.screen.height / 2 - treasure.height / 2;
  stage.addChild(treasure);

  // Blobs
  for (let i = 0; i < 10; i++) {
    var blob = new Sprite(id["blob.png"]);
    blob.x = Math.random() * (renderer.screen.width - 48*2) + 48;
    blob.y = Math.random() * (renderer.screen.height - 48*2) + 48;
    blob.dir = Math.trunc(Math.random() * 2);
    blob.dirReturn = Math.trunc(Math.random() * 2);
    blobs.push(blob);
    stage.addChild(blob);
  }

  message = new Text(
    "You Won!",
    {fontFamily: "Arial", fontSize: 32, fill: "white"}
  );
  message.x = renderer.screen.width / 2 - message.width / 2;
  message.y = renderer.screen.height / 2 - message.height / 2;
  message.visible = false;
  stage.addChild(message);

  state = play;

  keyboardHandling();

  //Tell the `renderer` to `render` the `stage`
  renderer.render(stage);
}


function gameLoop() {

  //Loop this function at 60 frames per second
  requestAnimationFrame(gameLoop);

  state();

  //Render the stage to see the animation
  renderer.render(stage);
}

//Start the game loop
gameLoop();


function play() {

  explorer.x += explorer.vx;
  explorer.y += explorer.vy;

  if (hitTestRectangle(treasure, explorer)) {
    state = end;
    message.visible = true;
  }

  blobs.forEach(function(blob){
    let distance = Math.trunc(Math.random() * 5);

    if (blob.dir) {
      if (blob.dirReturn)
        blob.y += distance;
      else
        blob.y -= distance;
    } else {
      if (blob.dirReturn)
        blob.x += distance;
      else
        blob.x -= distance;
    }

    if (blob.x <= 48) { blob.x = 48; blob.dirReturn = !blob.dirReturn; }
    if (blob.y <= 48) { blob.y = 48; blob.dirReturn = !blob.dirReturn; }
    if (blob.x >= renderer.screen.width - 48) { blob.x = renderer.screen.width - 48; blob.dirReturn = !blob.dirReturn; }
    if (blob.y >= renderer.screen.height - 48) { blob.y = renderer.screen.height - 48; blob.dirReturn = !blob.dirReturn; }

    if (hitTestRectangle(blob, explorer)) {
      explorer.x = 48;
      explorer.y = renderer.screen.height / 2 - explorer.height / 2;
    }



  });
}



function end() {

}



function keyboardHandling() {
  //Capture the keyboard arrow keys
  var left = keyboard(37),
    up = keyboard(38),
    right = keyboard(39),
    down = keyboard(40);

  //Left arrow key `press` method
  left.press = function() {

    console.log("LEFT ");

    //Change the cat's velocity when the key is pressed
    explorer.vx = -5;
    explorer.vy = 0;
  };

  //Left arrow key `release` method
  left.release = function() {

    //If the left arrow has been released, and the right arrow isn't down,
    //and the explorer isn't moving vertically:
    //Stop the explorer
    if (!right.isDown && explorer.vy === 0) {
      explorer.vx = 0;
    }
  };

  //Up
  up.press = function() {
    explorer.vy = -5;
    explorer.vx = 0;
  };
  up.release = function() {
    if (!down.isDown && explorer.vx === 0) {
      explorer.vy = 0;
    }
  };

  //Right
  right.press = function() {
    explorer.vx = 5;
    explorer.vy = 0;
  };
  right.release = function() {
    if (!left.isDown && explorer.vy === 0) {
      explorer.vx = 0;
    }
  };

  //Down
  down.press = function() {
    explorer.vy = 5;
    explorer.vx = 0;
  };
  down.release = function() {
    if (!up.isDown && explorer.vx === 0) {
      explorer.vy = 0;
    }
  };
}


//The `keyboard` helper function
function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
      event.preventDefault();
    }
  };
  //The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
      event.preventDefault();
    }
  };
  //Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}


//The `hitTestRectangle` function
function hitTestRectangle(r1, r2) {
  //Define the variables we'll need to calculate
  var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  //hit will determine whether there's a collision
  hit = false;
  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;
  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;
  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;
  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;
  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    //A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      //There's definitely a collision happening
      hit = true;
    } else {
      //There's no collision on the y axis
      hit = false;
    }
  } else {
    //There's no collision on the x axis
    hit = false;
  }
  //`hit` will be either `true` or `false`
  return hit;
};
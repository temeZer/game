var canvas = document.getElementById("game")
var c = canvas.getContext("2d")
var height = window.innerHeight
var width = window.innerWidth
canvas.height = height
canvas.width = width

canvas.addEventListener('contextmenu', event => event.preventDefault());

let gameRunning = true
let pressedButtons = []
let activeActions = []
let player = {
	width: 100,
	height: 250,
	x: 500,
	y: 500,
	xSpeed: 0,
	ySpeed: 0,
	onFloor: false,
	maxVelocity: 10,
}
const gameProperties = {
	acceleration: function(x) {
		return x * x 
	}
}


let textures = {
	brick: "images/brick.png",
	pause: "images/pause.png",
	player: "images/player.png",
}


//loads textures and starts draw() after that
;(function() {
	let loadCount = 0
	let texturesList = Object.getOwnPropertyNames(textures)
	for (var i = 0; i < texturesList.length; i++) {
		let name = texturesList[i]
		let src = textures[name]

		textures[name] = new Image()
		textures[name].src = src
	
		textures[name].onload = function() {
			loadCount++
			if(loadCount == texturesList.length){
				draw()
			}
		}
	}
})()

let solidObjects = [
	{
		type: "rectangle",
		start: [0, 800],
		size: [1920, 25],
		color: "#f00",
	},
	{
		type: "rectangle",
		start: [0, 0],
		size: [30, 30],
		color: "#00f",
	},
	{
		type: "image",
		start: [0, 500],
		size: [60, 60],
		texture: textures.brick,
	},
	{
		type: "image",
		start: [60, 800],
		size: [60, 60],
		texture: textures.brick,
	},
	{
		type: "image",
		start: [120, 800],
		size: [60, 60],
		texture: textures.brick,
	},
]


//returns what action the keyCode represents
var getKeyAction = (keyCode) => {
	let binds = {
		up: [87, 38],
		down: [83, 40],
		right: [68, 39],
		left: [65, 37],
		pause: [27],
		space: [32],
	}
	let listOfActions = Object.getOwnPropertyNames(binds)
	for (let i = 0; i < listOfActions.length; i++) {

		let keyCodesToCheck = binds[listOfActions[i]]
		for (let j = 0; j < keyCodesToCheck.length; j++) {

			if (keyCodesToCheck[j] == keyCode) {
				return listOfActions[i]
			}
		}
	}
	return null
}

document.onkeydown = function(info) {
	if (pressedButtons.indexOf(info.keyCode) == -1) {
		pressedButtons.push(info.keyCode)
		let action = getKeyAction(info.keyCode)
		if (action) {
			if (activeActions.indexOf(action) == -1) {
				activeActions.push(action)
				if(action == "pause") {
					gameRunning = gameRunning * (-1) + 1
					draw()
				}
			}
		}
	}
}
document.onkeyup = function(info) {	
	if (pressedButtons.indexOf(info.keyCode) != -1) {
		pressedButtons.splice(pressedButtons.indexOf(info.keyCode), 1)
		let action = getKeyAction(info.keyCode)
		if (action) {
			if (activeActions.indexOf(action) != -1) {
				activeActions.splice(activeActions.indexOf(action), 1)
			}
		}
	}
}

function draw(){
	c.clearRect(0, 0, canvas.width, canvas.height)

	c.imageSmoothingEnabled = false
	c.drawImage(textures.player, player.x, player.y, player.width, player.height)

	drawObjects()

	movePlayer()

	if (gameRunning) {
		window.requestAnimationFrame(draw)
	} else {
		c.imageSmoothingEnabled = false
		c.drawImage(textures.pause, width/2, height/2)
	}
}

function drawObjects() {
	for (var i = 0; i < solidObjects.length; i++) {
		var object = solidObjects[i]

		if (object.type == "image") {
			c.imageSmoothingEnabled = false
			c.drawImage(object.texture, object.start[0], object.start[1], object.size[0], object.size[1])
		} else if (object.type == "rectangle") {
			c.beginPath();
			c.moveTo(object.start[0], object.start[1])
			c.lineTo(object.start[0], object.start[1] + object.size[1])
			c.lineTo(object.start[0] + object.size[0], object.start[1] + object.size[1])
			c.lineTo(object.start[0] + object.size[0], object.start[1])
			c.lineTo(object.start[0], object.start[1])
			c.fillStyle = object.color
			c.fill()
		}
	}
	//c.stroke()
}

function movePlayer() {
	if (activeActions.indexOf("right") != -1) {
		if (activeActions.indexOf("left") != -1) {
			player.xSpeed = 0
		} else {
			if (player.xSpeed != 5) {
				player.xSpeed += -.08*player.xSpeed*player.xSpeed + 2.125
				if (player.xSpeed > 5) {
					player.xSpeed = 5
				}
			}
		}
	} else if (activeActions.indexOf("left") != -1) {
		if (player.xSpeed != -5) {
			player.xSpeed -= -.08*player.xSpeed*player.xSpeed + 2.125
			if (player.xSpeed > 5) {
				player.xSpeed = 5
			}
		}
	} else {
		player.xSpeed = 0
	}

	if (activeActions.indexOf("down") != -1) {
		if (activeActions.indexOf("up") != -1) {
			player.ySpeed = 0
		} else {
			if (player.ySpeed != 5) {
				player.ySpeed += -.08*player.ySpeed*player.ySpeed + 2.125
				if (player.ySpeed > 5) {
					player.ySpeed = 5
				}
			}
		}
	} else if (activeActions.indexOf("up") != -1) {
		if (player.ySpeed != -5) {
			player.ySpeed -= -.08*player.ySpeed*player.ySpeed + 2.125
			if (player.ySpeed > 5) {
				player.ySpeed = 5
			}
		}
	} else {
		player.ySpeed = 0
	}

	/*if (!player.onFloor) {
		player.ySpeed += 1
	}*/

	//for (var i )

	if (activeActions.indexOf("space") != -1) {
		checkCollision([player.x, player.y], [player.x + player.xSpeed, player.y + player.ySpeed])
	}

	player.x += player.xSpeed
	player.y += player.ySpeed
}

function checkCollision(oldPos, newPos) {
	let minPos = oldPos
	let maxPos = newPos
	if (minPos[0] > maxPos[0]) {
		let max = minPos[0]
		minPos[0] = maxPos[0]
		maxPos[0] = max 
	}
	if (minPos[1] > maxPos[1]) {
		let max = minPos[1]
		minPos[1] = maxPos[1]
		maxPos[1] = max 
	}
	maxPos[0] += player.width
	maxPos[1] += player.height

	let collisions = []

	for (var i = 0; i < solidObjects.length; i++) {
		if(minPos[0] < solidObjects[i].start[0] || minPos[0] < solidObjects[i].start[0] + solidObjects[i].size[0]) {
		if(maxPos[0] > solidObjects[i].start[0] || maxPos[0] > solidObjects[i].start[0] + solidObjects[i].size[0]) {
		if(minPos[1] < solidObjects[i].start[1] || minPos[1] < solidObjects[i].start[1] + solidObjects[i].size[1]) {
		if(maxPos[1] > solidObjects[i].start[1] || maxPos[1] > solidObjects[i].start[1] + solidObjects[i].size[1]) {
			collisions.push(i)
		}
		}
		}
		}
	}
	if(collisions.length) {
		console.log(collisions)
	}
}
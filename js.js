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
	{
		type: "image",
		start: [800, 400],
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

function movePlayer() { //changes the player position according to it's speed and accelerates/deaccelerates the speed if direction buttons are/aren't pressed
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


	//player.x += player.xSpeed
	//player.y += player.ySpeed

	nearCollision()
}


function nearCollision() { //finds all objects that could be in the way
	let minPos = [player.x, player.y]
	let maxPos = [player.x + player.xSpeed, player.y + player.ySpeed]
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
			let object = solidObjects[i]
			collisions.push([object.start, object.size])
		}
		}
		}
		}
	}

	for (var i = 0; i < collisions.length; i++) {
		if (player.xSpeed > 0) {
			if (player.x + player.width == collisions[i][0][0]) {
				player.xSpeed = 0
			}
		} else if (player.xSpeed < 0) {
			if (player.x == collisions[i][0][0] + collisions[i][1][0]) {
				player.xSpeed = 0
			}
		}

		if (player.ySpeed > 0) {
			if (player.y + player.height == collisions[i][0][1]) {
				player.ySpeed = 0
			}
		} else if (player.ySpeed < 0) {
			if (player.y == collisions[i][0][1] + collisions[i][1][1]) {
				player.ySpeed = 0
			}
		}
	}

	if(collisions.length) {
		checkCollision(collisions)
	} else {
		player.x += player.xSpeed
		player.y += player.ySpeed
	}
}

function checkCollision(list) {
	//lines are expressed with the following syntax: [[x-starting point, y-starting point], [x-ending point, y-ending point]]

	let oldPos = [player.x, player.y]
	let newPos = [player.x + player.xSpeed, player.y + player.ySpeed]

	let xDirection = 0
	let yDirection = 0
	if(oldPos[0] < newPos[0]) {
		xDirection = 1
	}
	if(oldPos[1] < newPos[1]) {
		yDirection = 1
	}

	//the sides of the player that are can posibbly collide
	let xCollisionLine
	let yCollisionLine

	if (xDirection) {
		xCollisionLine = [[oldPos[0] + player.width, oldPos[1]], [oldPos[0] + player.width, oldPos[1] + player.height]]
	} else {
		xCollisionLine = [[oldPos[0], oldPos[1]], [oldPos[0], oldPos[1] + player.height]]
	}
	if (yDirection) {
		yCollisionLine = [[oldPos[0], oldPos[1] + player.height], [oldPos[0] + player.width, oldPos[1] + player.height]]
	} else {
		yCollisionLine = [[oldPos[0], oldPos[1]], [oldPos[0] + player.width, oldPos[1]]]
	}

	//the sides of the objects that are can posibbly collide
	let xObjectCollisionList = []
	let yObjectCollisionList = []
	
	for (var i = 0; i < list.length; i++) {
		if (xDirection) {
			xObjectCollisionList.push([[list[i][0][0], list[i][0][1]], [list[i][0][0], list[i][0][1] + list[i][1][1]]])
		} else {
			xObjectCollisionList.push([[list[i][0][0] + list[i][1][0], list[i][0][1]], [list[i][0][0] + list[i][1][0], list[i][0][1] + list[i][1][1]]])
		}

		if (yDirection) {
			yObjectCollisionList.push([[list[i][0][0], list[i][0][1]], [list[i][0][0] + list[i][1][0], list[i][0][1]]])
		} else {
			yObjectCollisionList.push([[list[i][0][0], list[i][0][1] + list[i][1][1]], [list[i][0][0] + list[i][1][0], list[i][0][1] + list[i][1][1]]])
		}
	}

	for (var i = 0; i < xObjectCollisionList.length; i++) {
		if (xDirection) {
			if (xCollisionLine[0][0] > xObjectCollisionList[i][0][0]) {
				xObjectCollisionList.splice(i, 1)
				i--
			}
		} else {
			if (xCollisionLine[0][0] < xObjectCollisionList[i][0][0]) {
				xObjectCollisionList.splice(i, 1)
				i--
			}
		}
	}
	for (var i = 0; i < yObjectCollisionList.length; i++) {
		if (yDirection) {
			if (yCollisionLine[0][1] > yObjectCollisionList[i][0][1]) {
				yObjectCollisionList.splice(i, 1)
				i--
			}
		} else {
			if (yCollisionLine[0][1] < yObjectCollisionList[i][0][1]) {
				yObjectCollisionList.splice(i, 1)
				i--
			}
		}
	}

	xObjectCollisionList.sort(function(a, b) {
		if (xDirection) {
			return a[0][0] - b[0][0]
		} else {
			return b[0][0] - a[0][0]
		}
	})
	yObjectCollisionList.sort(function(a, b) {
		if (yDirection) {
			return a[0][1] - b[0][1]
		} else {
			return b[0][1] - a[0][1]
		}
	})

	let xDistance = (newPos[0] - oldPos[0])
	let yDistance = (newPos[1] - oldPos[1])

	let xMultiplier
	let yMultiplier
	let finalMultiplier = false

	/*if(yObjectCollisionList.length) {
		console.log(yObjectCollisionList)
	}*/

	while ((xObjectCollisionList.length != 0 || yObjectCollisionList.length != 0) && finalMultiplier === false ) {
		if (xObjectCollisionList.length) {
			xMultiplier = Math.abs((xObjectCollisionList[0][0][0] - xCollisionLine[0][0])/(xDistance))
		} else {
			xMultiplier = 1
		}
		if (yObjectCollisionList.length) {
			yMultiplier = Math.abs((yObjectCollisionList[0][0][1] - yCollisionLine[0][1])/(yDistance))
		} else {
			yMultiplier = 1
		}

		if (xMultiplier < yMultiplier) {
			let tempXCollisionLine = [[xObjectCollisionList[0][0][0], xCollisionLine[0][1] + (yDistance * xMultiplier)], [xObjectCollisionList[0][0][0], xCollisionLine[1][1]  + (yDistance * xMultiplier)]]
			//console.log(tempXCollisionLine, xObjectCollisionList[0], "x")
			if (xObjectCollisionList[0][0][1] <= tempXCollisionLine[0][1] && xObjectCollisionList[0][1][1] >= tempXCollisionLine[1][1]
				||
				xObjectCollisionList[0][0][1] > tempXCollisionLine[0][1] && xObjectCollisionList[0][0][1] < tempXCollisionLine[1][1]
				||
				xObjectCollisionList[0][1][1] > tempXCollisionLine[0][1] && xObjectCollisionList[0][1][1] < tempXCollisionLine[1][1]) {

				finalMultiplier = xMultiplier
				player.xSpeed = 0
				//console.log ("finalMultiplier is x", finalMultiplier)
			} else {
				xObjectCollisionList.shift()
			}
		} else if (xMultiplier > yMultiplier) {
			let tempYCollisionLine = [[yCollisionLine[0][0] + (xDistance * yMultiplier), yObjectCollisionList[0][0][1]], [yCollisionLine[1][0] + (xDistance * yMultiplier), yObjectCollisionList[0][0][1]]]
			//console.log(tempYCollisionLine, yObjectCollisionList[0], "y")
			if (yObjectCollisionList[0][0][0] <= tempYCollisionLine[0][0] && yObjectCollisionList[0][1][0] >= tempYCollisionLine[1][0]
				||
				yObjectCollisionList[0][0][0] > tempYCollisionLine[0][0] && yObjectCollisionList[0][0][0] < tempYCollisionLine[1][0]
				||
				yObjectCollisionList[0][1][0] > tempYCollisionLine[0][0] && yObjectCollisionList[0][1][0] < tempYCollisionLine[1][0]) {

				finalMultiplier = yMultiplier
				player.ySpeed = 0
				//console.log ("finalMultiplier is y", finalMultiplier)
			} else {
				yObjectCollisionList.shift()
			}
		}

		if (isNaN(xMultiplier)) {
			//console.log(xObjectCollisionList[0][0][0], xCollisionLine[0][0], xDistance)
			finalMultiplier = yMultiplier
		}

		if (isNaN(yMultiplier)) {
			//console.log(yObjectCollisionList[0][0][1], yCollisionLine[0][1], yDistance)
			finalMultiplier = xMultiplier
		}

		/*
		console.log("length", xObjectCollisionList.length, yObjectCollisionList.length)
		console.log("dist", xDistance, yDistance)
		console.log("mult", xMultiplier, yMultiplier)
		console.log("speed", player.xSpeed, player.ySpeed)
		*/
	}

	if (!finalMultiplier) {
		finalMultiplier = 1
	}

	player.x = oldPos[0] + finalMultiplier * (xDistance)
	player.y = oldPos[1] + finalMultiplier * (yDistance)

	return
}
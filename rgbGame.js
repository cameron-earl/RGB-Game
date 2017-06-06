"use strict";

// ************ GLOBAL VARIABLES ************

const STANDARD_BACKGROUND_COLOR = "232323";
const BASIC_COLORS = ["red","green","blue","yellow","cyan","magenta"];

const BODY = document.querySelector("body");
const HEADER = document.querySelector("#header");
const COLOR_CONTAINER = document.querySelector("#color-container");
const WHITE_BAR = document.querySelector("#white-bar");
const STATS = document.querySelector("#stats");
const MESSAGE = document.querySelector("#message");
const LEVEL_INPUT = document.querySelector("#levelInput");
const WIN_COUNT = document.querySelector("#winCount");
const LOSS_COUNT = document.querySelector("#lossCount");
const WINNING_COLOR_DISPLAY = document.querySelector("#winningColor");
const NEW_GAME_BTN = document.querySelector("#newGameBtn");
const INFO_BTN = document.querySelector("#learnMore");
const INFO = document.querySelector("#info-screen");
const FLASH = document.querySelector("#flash");
const WIN_ICON = document.querySelector("#winUp");
const LOSE_ICON = document.querySelector("#lossUp");

var currentLevel = 2;
var highestLevel = 2;
var newLevelUnlocked = false;
var optionCount = 4;
var remaining = optionCount;
var rowCount = 2;
var winningColor = "RGB";
var winMsg = "You win!";
var newLevelMsg = "You won and unlocked the next level!";
var gameOver = false;
var colors = [];
var squares = [];
var winningIndex = 0;
var winCount = 0;
var lossCount = 0;
var mouseDown = false;
var shiftDown = false;

var MESSAGES = [
	"Click the color described by the RGB code above.",
	"Hints sometimes appear up here.",
	"Beating the hardest level will unlock a harder one.",
	"See the code at <a href='https://www.github.com/randomraccoon/RGB-Game'>github.com/randomraccoon/RGB-Game</a>",
	"You won't be able to unlock higher levels just by guessing.",
	"You can click here to reveal stats and options.",
	"How high of a level can you beat?",
	"Unsure? It helps to eliminate the ones you know are wrong.",
	"Red and green in equal amounts make yellow.",
	"Green and blue in equal amounts make cyan.",
	"Red and blue in equal amounts make magenta.",
	"If red, green and blue are equal it makes a shade of gray.",
	"If all the numbers are high, it will be very light.",
	"If RGB doesn't make much sense, you might prefer HSL.",
	"To start a new game, you can also click a square.",
	"You always can switch to an easier level if it gets too difficult.",
	"To turn off auto-advance, just change off the hardest level.",
	"You can eliminate squares with a right-click or a shift+left-click.",
	"Bold colors have both a low value and a high value in the RGB code.",
	"You can shift+click and drag to easily eliminate many squares."
];

// ************ STATIC FUNCTIONS ************

function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function rgbComponents(c) {
	c = c.split(",");
	var RGB = [];
	RGB[0] = Number(c[0].slice(4));
	RGB[1] = Number(c[1]);
	RGB[2] = Number(c[2].replace( ")", "" ));
	RGB[3] = c[3] ? Number(parseFloat(c[3])) : -1;
	return RGB;
}

function getRandomColor() {
	var r = randInt(0,255);
	var g = randInt(0,255);
	var b = randInt(0,255);
	return "rgb(" + r + ", " + g + ", " + b + ")";
}

function countFromLevel(level) {
	return level*level;
}

// ************ FUNCTIONS USING GLOBAL VARS ************

function getRandomMessage() {
	var msg;
	var probabilityOfHint = 0.3;
	if (Math.random() < probabilityOfHint) {
		msg = hint();
	} else {
		msg = MESSAGES[randInt(0,MESSAGES.length-1)];
	}
	return msg;
}

function toggleStatsView() {
	updateStats();
	STATS.classList.toggle("hidden");
	MESSAGE.classList.toggle("hidden");
}

function displayStats() {
	updateStats();
	if (STATS.classList.contains("hidden")) {
		toggleStatsView();
	}
}

function displayMessage() {
	updateMessage();
	if (MESSAGE.classList.contains("hidden")) {
		toggleStatsView();
	}
}

function updateStats() {
	WIN_COUNT.textContent = winCount;
	LOSS_COUNT.textContent = lossCount;
	updateMessage();
}

function updateMessage() {
	if (squares.length === optionCount && winCount === 0) {
		MESSAGE.textContent = MESSAGES[0];
	} else {
		MESSAGE.innerHTML = squares.length + " left. " + getRandomMessage();
	}
	var anchor = MESSAGE.querySelector("a");
	if (anchor) {
		anchor.addEventListener("click",function(ev) {
			ev.stopPropagation();
		});
	}
}

function hint() {
	var rgbArr = rgbComponents(winningColor);
	var rgbArr2 = rgbArr.slice();
	var maxIndex = rgbArr.indexOf(Math.max(rgbArr2[0], rgbArr2[1], rgbArr2[2]));
	var midIndex = rgbArr.indexOf(Math.max(rgbArr2[0], rgbArr2[1]));
	rgbArr2.splice(midIndex, 1);
	var minIndex = rgbArr.indexOf(rgbArr2[0]);
	var boldRating = rgbArr[maxIndex] - rgbArr[minIndex];
	var maxHint = "This color sure has a lot of " + BASIC_COLORS[maxIndex] + ".";
	var minHint = "I'm not sure what color this is, but it's not " + BASIC_COLORS[minIndex] + ".";
	var boldHint =  
		(boldRating >= 256 * 0.8) ? "This color is pretty bold." :
		(boldRating <= 256 * 0.2) ? "This color is pretty bland." : "";
	var hints = [maxHint, minHint, boldHint];
	return hints[randInt(0,hints.length - 1)];
}

function eliminate(el) {
	el.classList.add("eliminated");
	remaining--;
	var index = squares.indexOf(el);
	squares.splice(index, 1);
	arrangeSquares();
	if (!gameOver && squares.length === 1) {
		win(squares[0]);
	}
	if (!gameOver) {
		displayMessage();
	}
}

function win(el) {
	gameOver = true;
	winCount++;
	var isTrying = lossCount * currentLevel / optionCount <= winCount;
	if (isTrying && currentLevel === highestLevel) {
		addNewLevel();
	}
	el.classList.add("winner");
	WIN_ICON.classList.remove("hidden");
	HEADER.style.backgroundColor = winningColor;
	if (squares.length > 1) {
		var index = squares.indexOf(el);
		for(var i = squares.length - 1; i >= 0; i--) {
			if (i === index) {
				continue;
			}
			eliminate(squares[i]);
		}
	}
	var textField = squares[0].querySelector(".winText");
	textField.textContent = newLevelUnlocked ? newLevelMsg : winMsg;
	textField.classList.remove("hidden");
	squares[0].querySelector(".squareText").classList.remove("hidden");
	displayStats();
	flash();
}

function lose(el) {
	lossCount++;
	displayStats();
	el.classList.add("loser");
	flash("red");
	LOSE_ICON.classList.remove("hidden");
	for (var i = 0; i < squares.length; i++) {
		var rgbStr = squares[i].style.backgroundColor;
		if (rgbStr === winningColor) {
			squares[i].classList.add("winner");
		}
		if (rowCount <= 11) {
			var rgbArr = rgbComponents(rgbStr);
			squares[i].querySelector(".redVal").textContent = rgbArr[0];
			squares[i].querySelector(".greenVal").textContent = rgbArr[1];
			squares[i].querySelector(".blueVal").textContent = rgbArr[2];
			squares[i].querySelector(".squareRGB").classList.remove("hidden");
			squares[i].querySelector(".squareText").classList.remove("hidden");
		}
		squares[i].classList.add("noTransform");
	}
	gameOver = true;
}

function addNewLevel() {
	highestLevel++;
	LEVEL_INPUT.max = highestLevel;
	LEVEL_INPUT.value = currentLevel;
	newLevelUnlocked = true;
}

function arrangeSquares() {
	var i;
	if (!shiftDown || remaining === 1) {
		if (remaining <= Math.pow(rowCount - 1, 2)) {
			var eliminated = COLOR_CONTAINER.querySelectorAll(".eliminated");
			for (i = 0; i < eliminated.length; i++) {
				eliminated[i].classList.remove("eliminated");
				eliminated[i].classList.add("hidden");
			}
		}

		rowCount = Math.ceil(Math.sqrt(squares.length));
		var squaresPerRow = rowCount;
		var availWidth = 100 - squaresPerRow * 2;
		var width = availWidth / squaresPerRow;
		var height = width;
		for(i = 0; i < squares.length; i++) {
			squares[i].style.width = width + "%";
			squares[i].style.height = height + "%";
		}
	}
}

function newGame() {
	gameOver = false;
	if (currentLevel !== +LEVEL_INPUT.value) {
		currentLevel = +LEVEL_INPUT.value;
	} else if (newLevelUnlocked) {
		LEVEL_INPUT.value = highestLevel;
		currentLevel = highestLevel;
	}
	newLevelUnlocked = false;
	LOSE_ICON.classList.add("hidden");
	WIN_ICON.classList.add("hidden");
	buildSquares();
	var textFieldArray = document.querySelectorAll(".squareText");
	for (var i = 0; i < textFieldArray.length; i++) {
		textFieldArray[i].querySelector(".winText").classList.add("hidden");
		textFieldArray[i].querySelector(".squareRGB").classList.add("hidden");
		textFieldArray[i].classList.add("hidden");
	}
	buildSquaresArr();
	winningIndex = randInt(0,optionCount);
	winningColor = getRandomColor();
	for (i = 0; i < optionCount; i++) {
		if (i === winningIndex) {
			colors[i] = winningColor;
		} else {
			colors[i] = getRandomColor();
		}
		squares[i].style.backgroundColor = colors[i];
		squares[i].classList.remove("hidden","winner","loser");
	}
	WINNING_COLOR_DISPLAY.textContent = winningColor;
	arrangeSquares();
	HEADER.style.backgroundColor = STANDARD_BACKGROUND_COLOR;
	displayMessage();
}

function buildSquaresHTML() {
	var squareHTML = "";
	for (var i = 0; i < optionCount; i++) {
		squareHTML += 
			'<div class="square">' + 
				'<div class="squareText">' + 
					'<div class="winText"></div>' + 
					'<div class="squareRGB">' +
						'<div class="redVal"></div>' +
						'<div class="greenVal"></div>' +
						'<div class="blueVal"></div>' +
					'</div>' +
				'</div>' +
			'</div>'; 
	}
	COLOR_CONTAINER.innerHTML = squareHTML;
}

function buildSquaresArr() {
	var els = document.querySelectorAll("#color-container .square");
	squares = [];
	for (var i = 0; i < els.length; i++) {
		squares[i] = els[i];
	}
}

function buildSquares() {
	colors = [];
	optionCount = countFromLevel(currentLevel);
	remaining = optionCount;
	buildSquaresHTML();
	buildSquaresArr();
	for (var i = 0; i < squares.length; i++) {
		squares[i].addEventListener("click", onLeftClick);
		squares[i].addEventListener("contextmenu", onRightClick);
		squares[i].addEventListener("mouseover", dragOnOff);
		squares[i].addEventListener("mouseout", dragOnOff);
	}
}

function dragOnOff() {
	var ev = window.event;
	if (mouseDown && ev.shiftKey) {
		onRightClick();
	}
}

function onLeftClick() {
	var ev = window.event;
	var el = ev.currentTarget;
	if (el.classList.contains("eliminated")) {
		return;
	}
	if (ev.shiftKey) {
		onRightClick();
		return;
	}
	if (!gameOver) {
		if (el.style.backgroundColor === winningColor) {
			win(el);
		} else {
			lose(el);
		}
	} else {
		newGame();
	}
}

function onRightClick() {
	var ev = window.event;
	ev.preventDefault();
	var el = ev.currentTarget;
	if (el.classList.contains("eliminated")) {
		return;
	}
	if (!gameOver) {
		if (el.style.backgroundColor === winningColor) {
			lose(el);
		} else {
			eliminate(el);
		}
	}
}

function flash(color, el) {
	if (!color) {
		color = "White";
	}
	if (!el) {
		el = FLASH;
	}
	el.style.backgroundColor = color;
	el.classList.add("elementToFadeInAndOut");
	setTimeout(function() {
		el.classList.remove("elementToFadeInAndOut");
	}, 500);
}

function toggleInfoScreen() {
	COLOR_CONTAINER.classList.toggle("hidden");
	INFO.classList.toggle("hidden");
	INFO_BTN.classList.toggle("icon-info");
	INFO_BTN.classList.toggle("icon-squares");
}

function initialize() {
	WHITE_BAR.addEventListener("click",toggleStatsView);

	BODY.addEventListener("contextmenu", function (ev) {
		ev.preventDefault();
	});

	document.addEventListener("mousedown", function () {
		mouseDown = true;
	});

	document.addEventListener("mouseup", function () {
		mouseDown = false;
	});

	document.addEventListener("keydown", function (ev) {
	  	if (ev.shiftKey) {
	  		if (!shiftDown) {
	  			shiftDown = true;
	  		}
  		}
  	});

  	document.addEventListener("keyup", function (ev) {
  		if (!ev.shiftKey && shiftDown) {
  			shiftDown = false;
  			arrangeSquares();
  		}
  	});

	HEADER.addEventListener("contextmenu", function (ev) {
		ev.stopPropagation();
	});

	NEW_GAME_BTN.addEventListener("click", function (ev) {
		ev.stopPropagation();
		newGame();
	});

	INFO_BTN.addEventListener("click", function (ev) {
		ev.stopPropagation();
		toggleInfoScreen();
	});

	LEVEL_INPUT.addEventListener("click", function (ev) {
		ev.stopPropagation();
	});

	LEVEL_INPUT.value = currentLevel;

	INFO.addEventListener("contextmenu", function (ev) {
		ev.stopPropagation();
	});

	var anchors = INFO.querySelectorAll("a");
	for (var i = 0; i < anchors.length; i++) {
		anchors[i].setAttribute("target", "_blank");
	}
}

// ************ CODE ************

initialize();
newGame();




















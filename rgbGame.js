"use strict";

// ************ GLOBAL VARIABLES ************

const STANDARD_BACKGROUND_COLOR = "232323";
const BASIC_COLORS = ["red","green","blue","yellow","cyan","magenta"];

const BODY = document.querySelector("body");
const HEADER = document.querySelector("#header");
const COLOR_CONTAINER = document.querySelector("#color-container");
const INFO = document.querySelector("#info");
const STATS = document.querySelector("#stats");
const MESSAGE = document.querySelector("#message");
const COUNT_INPUT = document.querySelector("#colorCountInput");
const WIN_COUNT = document.querySelector("#winCount");
const LOSS_COUNT = document.querySelector("#lossCount");
const WINNING_COLOR_DISPLAY = document.querySelector("#winningColor");
const NEW_GAME_BTN = document.querySelector("#newGameBtn");


var optionCount = 6;
var rowCount = 2;
var winningColor = "RGB";
var winMsg = "You win!";
var gameOver = false;
var colors = [];
var squares = [];
var winningIndex = 0;
var winCount = 0;
var lossCount = 0;

var MESSAGES = [
	"Click the right color, or eliminate squares by right clicking.",
	"Hints sometimes appear up here.",
	"This code is on github! https://github.com/randomraccoon/RGB-Game"
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
	if (squares.length === optionCount) {
		MESSAGE.textContent = MESSAGES[0];
	} else {
		MESSAGE.textContent = squares.length + " remaining. " + getRandomMessage();
	}
	 
}

function hint() {
	var rgbArr = rgbComponents(winningColor);
	console.log("rgbArr: ", rgbArr);
	var rgbArr2 = rgbArr.slice();
	console.log("rgbArr2: ", rgbArr2);
	var maxIndex = rgbArr.indexOf(Math.max(rgbArr2[0], rgbArr2[1], rgbArr2[2]));
	rgbArr2.splice(maxIndex, 1);
	var midIndex = rgbArr.indexOf(Math.max(rgbArr2[0], rgbArr2[1]));
	rgbArr2.splice(midIndex, 1);
	console.log(rgbArr2);
	var minIndex = rgbArr.indexOf(rgbArr2[0]);
	var boldRating = rgbArr[maxIndex] - rgbArr[minIndex];
	var maxHint = "This color sure has a lot of " + BASIC_COLORS[maxIndex] + ".";
	var minHint = "I'm not sure what color this is, but it's not " + BASIC_COLORS[minIndex] + ".";
	var boldHint =  
		(boldRating >= 256 * .8) ? "This color is pretty bold." :
		(boldRating <= 256 * .2) ? "This color is pretty bland." : "";
	var hints = [maxHint, minHint, boldHint];
	console.log("maxIndex: " + maxIndex);
	console.log("midIndex: " + midIndex);
	console.log("minIndex: " + minIndex);
	return hints[randInt(0,hints.length - 1)];
}

function eliminate(el) {
	el.classList.add("hidden");
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
	el.classList.add("winner");
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
	textField.textContent = winMsg;
	textField.classList.remove("hidden");
	displayStats();
}

function lose(el) {
	lossCount++;
	displayStats();
	el.classList.add("loser");
	for (var i = 0; i < squares.length; i++) {
		var rgbStr = squares[i].style.backgroundColor;
		if (rgbStr === winningColor) {
			squares[i].classList.add("winner");
		}
		if (rowCount <= 11) { // todo: change to pixel width of square[0]
			var rgbArr = rgbComponents(rgbStr);
			squares[i].querySelector(".redVal").textContent = rgbArr[0];
			squares[i].querySelector(".greenVal").textContent = rgbArr[1];
			squares[i].querySelector(".blueVal").textContent = rgbArr[2];
			squares[i].querySelector(".squareRGB").classList.remove("hidden");
		}
		
	}
	gameOver = true;
}

function arrangeSquares() {
	rowCount = Math.ceil(Math.sqrt(squares.length));
	var squaresPerRow = rowCount;
	var availWidth = 100 - squaresPerRow * 2;
	var width = availWidth / squaresPerRow;
	var height = width;
	for(var i = 0; i < squares.length; i++) {
		squares[i].style.width = width + "%";
		squares[i].style.height = height + "%";
	}
}

function newGame() {
	gameOver = false;
	var newCount = +COUNT_INPUT.value;
	if (!isNaN(newCount) && optionCount !== newCount) {
		buildSquares();
	}
	var textFieldArray = document.querySelectorAll(".squareText");
	for (var i = 0; i < textFieldArray.length; i++) {
		textFieldArray[i].querySelector(".winText").classList.add("hidden");
		textFieldArray[i].querySelector(".squareRGB").classList.add("hidden");
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
	WINNING_COLOR_DISPLAY.textContent = winningColor.toUpperCase();
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
	optionCount = +COUNT_INPUT.value;
	colors = [];
	buildSquaresHTML();
	buildSquaresArr();
	for (var i = 0; i < squares.length; i++) {
		squares[i].addEventListener("click", onLeftClick);
		squares[i].addEventListener("contextmenu", onRightClick);
	}
}

function onLeftClick() {
	console.log('onLeftClick square');
	var el = window.event.currentTarget;
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
	console.log('onRightClick square');
	var ev = window.event;
	ev.preventDefault();
	var el = ev.currentTarget;
	if (!gameOver) {
		if (el.style.backgroundColor === winningColor) {
			lose(el);
		} else {
			eliminate(el);
		}
	}
}

function initialize() {
	INFO.addEventListener("click",toggleStatsView);
	NEW_GAME_BTN.addEventListener("click", function(ev) {
		console.log('onLeftClick newGameBtn');
		newGame();
		ev.stopPropagation();
	});
	HEADER.addEventListener("contextmenu", function(ev) {
		console.log('onRightClick HEADER');
		ev.stopPropagation();
	});
	COUNT_INPUT.addEventListener("click", function(ev) {
		ev.stopPropagation();
	});
	BODY.addEventListener("contextmenu", function(ev) {
		console.log('onRightClick BODY');
		ev.preventDefault();
	});
	COUNT_INPUT.value = +optionCount;
	buildSquares();
	newGame();
}

// ************ CODE ************

initialize();






















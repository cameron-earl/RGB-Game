//todo: restart button, hi, change
"use strict";
var optionCount = 6;
var colors = [];
var squares = [];
var winningIndex = 0;
var winningColor = "RGB";
var winMsg = "You win!";
var gameOver = false;
var winCount = 0;
var lossCount = 0;
var stats = document.querySelector("#stats");
var description = document.querySelector("#description");
var info = document.querySelector("#info");
var countInput = document.querySelector("#colorCountInput");
var standardBackgroundColor = "232323";
const TOTAL_SQUARE_HEIGHT = 75;

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

function randomColor() {
	var r = randInt(0,255);
	var g = randInt(0,255);
	var b = randInt(0,255);
	return "rgb(" + r + ", " + g + ", " + b + ")";
}

function toggleStatsView() {
	updateStats();
	stats.classList.toggle("hidden");
	description.classList.toggle("hidden");
}

function displayStats() {
	updateStats();
	if (stats.classList.contains("hidden")) {
		toggleStatsView();
	}
}


function updateStats() {
	document.querySelector("#winCount").textContent = winCount;
	document.querySelector("#lossCount").textContent = lossCount;
}

function eliminate(el) {
	el.classList.add("hidden");
	var index = squares.indexOf(el);
	squares.splice(index, 1);
	arrangeSquares();
	if (!gameOver && squares.length === 1) {
		win(squares[0]);
	}
}

function win(el) {
	gameOver = true;
	winCount++;
	displayStats();
	el.classList.add("winner");
	document.querySelector("#header").style.backgroundColor = winningColor;
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
		var rgbArr = rgbComponents(rgbStr);
		squares[i].querySelector(".redVal").textContent = rgbArr[0];
		squares[i].querySelector(".greenVal").textContent = rgbArr[1];
		squares[i].querySelector(".blueVal").textContent = rgbArr[2];
		squares[i].querySelector(".squareRGB").classList.remove("hidden");
	}
	gameOver = true;
}

function arrangeSquares() {
	var rowCount = Math.floor(Math.sqrt(squares.length));
	var squaresPerRow = Math.ceil(squares.length / rowCount);
	var availWidth = 100 - squaresPerRow * 2;
	var width = availWidth / squaresPerRow;
	var availHeight = TOTAL_SQUARE_HEIGHT - rowCount * 1.7;
	var height = (availHeight / rowCount);
	for(var i = 0; i < squares.length; i++) {
		squares[i].style.width = width + "%";
		squares[i].style.height = height + "%";
	}
}

function newGame() {
	var newCount = +(countInput.value);
	if (!isNaN(newCount) && optionCount !== newCount) {
		buildSquares();
	}
	var textFieldArray = document.querySelectorAll(".squareText");
	for (var i = 0; i < textFieldArray.length; i++) {
		textFieldArray[i].querySelector(".winText").classList.add("hidden");
		textFieldArray[i].querySelector(".squareRGB").classList.add("hidden");
	}
	gameOver = false;
	buildSquaresArr();
	winningIndex = randInt(0,optionCount);
	winningColor = randomColor();
	for (i = 0; i < optionCount; i++) {
		if (i === winningIndex) {
			colors[i] = winningColor;
		} else {
			colors[i] = randomColor();
		}
		squares[i].style.backgroundColor = colors[i];
		squares[i].classList.remove("hidden","winner","loser");
	}
	document.querySelector("#winningColor").textContent = winningColor.toUpperCase();
	arrangeSquares();
	document.querySelector("#header").style.backgroundColor = standardBackgroundColor;
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
	document.querySelector("#color-container").innerHTML = squareHTML;
}

function buildSquaresArr() {
	var els = document.querySelectorAll("#color-container .square");
	squares = [];
	for (var i = 0; i < els.length; i++) {
		squares[i] = els[i];
	}
}

function buildSquares() {
	optionCount = +countInput.value;
	colors = [];
	buildSquaresHTML();
	buildSquaresArr();
	for (var i = 0; i < squares.length; i++) {
		squares[i].addEventListener("click", onLeftClick);
		squares[i].addEventListener("contextmenu", onRightClick);
	}
}

function onLeftClick() {
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
	info.addEventListener("click",toggleStatsView);
	document.querySelector("#newGameBtn").addEventListener("click", function(ev) {
		newGame();
		ev.stopPropagation();
	});
	document.querySelector("#header").addEventListener("contextmenu", function(ev) {
		ev.stopPropagation();
	});
	countInput.addEventListener("click", function(ev) {
		ev.stopPropagation();
	});
	document.querySelector("body").addEventListener("contextmenu", function(ev) {
		ev.preventDefault();
	});
	countInput.value = +optionCount;
	buildSquares();
	newGame();
}

initialize();






















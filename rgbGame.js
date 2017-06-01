//todo: restart button

var optionCount = 3;
var colors = new Array(optionCount);
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
	document.querySelector("#winCount").textContent = winCount;
	document.querySelector("#lossCount").textContent = lossCount;
	stats.classList.toggle("hidden");
	description.classList.toggle("hidden");
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
	el.classList.add("winner");
	document.querySelector("#header").style.backgroundColor = winningColor;
	winCount++;
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
	toggleStatsView();
}

function lose(el) {
	lossCount++;
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
	toggleStatsView();
	gameOver = true;
}

function arrangeSquares() {
	var availWidth = 100 - squares.length * 2;
	var width = availWidth / squares.length;
	for(var i = 0; i < squares.length; i++) {
		squares[i].style.width = width + "%";
	}
}

function buildSquaresArr() {
	var els = document.querySelectorAll("#color-container .square");
	squares = [];
	for (var i = 0; i < els.length; i++) {
		squares[i] = els[i];
	}
}

function newGame() {
	if (description.classList.contains("hidden")) {
		toggleStatsView();
	}
	var textFieldArray = document.querySelectorAll(".squareText");
	for (var i = 0; i < textFieldArray.length; i++) {
		textFieldArray[i].querySelector(".winText").classList.add("hidden");
		textFieldArray[i].querySelector(".squareRGB").classList.add("hidden");
	}
	gameOver = false;
	buildSquaresArr();
	for (var i = 0; i < colors.length; i++) {
		colors[i] = randomColor();
		squares[i].style.backgroundColor = colors[i];
		squares[i].classList.remove("hidden","winner","loser");
	}
	winningColor = colors[randInt(0,squares.length)];
	document.querySelector("#winningColor").textContent = winningColor.toUpperCase();
	arrangeSquares();
}

function buildSquaresHTML() {
	var squareHTML = "";
	for (var i = 0; i < optionCount; i++) {
		squareHTML += 	`
			<div class="square">
				<div class="squareText">
					<div class="winText"></div>
					<div class="squareRGB">
						<div class="redVal"></div>
						<div class="greenVal"></div>
						<div class="blueVal"></div>
					</div>
				</div>
			</div>`;
	}
	document.querySelector("#color-container").innerHTML = squareHTML;
}

function initialize() {
	buildSquaresHTML();
	buildSquaresArr();
	for (var i = 0; i < squares.length; i++) {
		
		squares[i].addEventListener("click", function() {
			if (!gameOver) {
				if (this.style.backgroundColor === winningColor) {
					win(this);
				} else {
					lose(this);
				}
			} else {
				newGame();
			}
		});
		squares[i].addEventListener("contextmenu", function(ev) {
			ev.preventDefault();
			if (!gameOver) {
				if (this.style.backgroundColor === winningColor) {
					lose(this);
				} else {
					eliminate(this);
				}
			}
		})
	}
	
	newGame();
}

info.addEventListener("click",toggleStatsView);

initialize();






















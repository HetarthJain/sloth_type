const words = "boy walked down street in a carefree way playing without notice of what was about him he did not hear sound of car as his ball careened into the road he took a step toward it and in doing so sealed his fate govern blow special amazing blue address little grandparents states country sky wood fire heat munch quill peacock cricket football oympics".split(" ")

const wordCount = words.length
// game stats
const gameTime = 60 * 1000;
window.timer = null;
window.gameStart = null;
window.pauseTime = 0;

// functions to add n remove names in classnames of html elements
function addClass(el, name) {
	el.className += " "+name
}
function removeClass(el, name) {
	el.className = el.className.replace(" "+name,"")
}

function randomWord(words) {
	const index = Math.ceil(Math.random() * wordCount)
	return words[index-1]
}
// Returns the word in a format of a Div block
function formatWord(word) {
	return `<div class="word"><span class="letter">${word.split("").join('</span><span class="letter">')}</span></div>`
}

function newGame() {
	// filling the words inside element
	document.getElementById('words').innerHTML = ""
	for (let i = 0; i < 200; i++){
		document.getElementById('words').innerHTML += formatWord(randomWord(words))	
	}
	// adding current labels to word and letter
	addClass(document.querySelector('.word'),'current')
	addClass(document.querySelector('.letter'), 'current')
	// setting game time
	document.getElementById('info').innerHTML = (gameTime / 1000) + '';
	window.timer = null;
}
function getWpm() {
	// taking all words into an array
	const allwords = [...document.querySelectorAll('.word')];
	const lastTypedWord = document.querySelector('.word.current');
	const lastTypedWordIndex = allwords.indexOf(lastTypedWord) + 1;
	const typedWords = allwords.slice(0, lastTypedWordIndex);

	const correctWords = typedWords.filter(word => {
	  const letters = [...word.children];
	  const incorrectLetters = letters.filter(letter => letter.className.includes('incorrect'));
	  const correctLetters = letters.filter(letter => letter.className.includes('correct'));
	  return incorrectLetters.length === 0 && correctLetters.length === letters.length;
	});
	return correctWords.length / gameTime * 60000;
}

function gameOver() {
	clearInterval(window.timer);
	addClass(document.getElementById('game'), 'over');
	const result = getWpm();
	document.getElementById('info').innerHTML = `WPM: ${result}`;
}

// Main running bloc
document.getElementById('game').addEventListener('keyup', ev => {
	console.log("running event listner")
	const key = ev.key
	const currWord = document.querySelector('.word.current')
	const currLetter = document.querySelector('.letter.current')
	const expected = currLetter?.innerHTML || ' '
	console.log({ key, expected })
	const isLetter = key.length === 1 && key !== ' '
	const isSpace = key === ' '
	const isBackspace = key === 'Backspace';
	const isFirstLetter = currLetter === currWord.firstChild;
	const extra = document.querySelector('letter.extra')
	
	if(document.querySelector('#game.over')) return

	if (!window.timer && isLetter) {
		window.timer = setInterval(() => {
			if (!window.gameStart) {
				window.gameStart = (new Date()).getTime()
			}
			console.log("inside set interval callback")
			const currTime = (new Date()).getTime()
			const timePassed = Math.round((currTime - window.gameStart) / 1000)
			const timeLeft = gameTime / 1000 - timePassed
			if (timeLeft <= 0) {
				gameOver()
				return;
			}
			document.getElementById('info').innerHTML = timeLeft+''
		}, 1000)
	}

	// checking if there is any letter input
	if (isLetter) {
		if (currLetter) {
			addClass(currLetter, key === expected ? 'correct' : 'incorrect')
			removeClass(currLetter, "current")
			if (currLetter.nextSibling) {
				addClass(currLetter.nextSibling, "current")
			}
		} else {
			const incorrectLetter = document.createElement('span')
			incorrectLetter.innerHTML = key
			incorrectLetter.className = 'letter incorrect extra'
			currWord.appendChild(incorrectLetter)
		}
	}
	// checking if there is any space input
	if (isSpace) {
		// if there is a space which is not expected -> invalidate all remaining letters of the word.
		if (expected !== " ") {
			// invalidate all letter of current word
			const invalidateLetters = [...document.querySelectorAll('.word.current .letter:not(.correct)')]
			invalidateLetters.forEach(letter => {
				addClass(letter,'incorrect')
			});
		}
		// after the word is over (correctly or incorrectly) then remove the current from word and add it to next word(sibling of div).
		removeClass(currWord,'current')
		addClass(currWord.nextSibling,'current')
		if (currLetter) {
			removeClass(currLetter, 'current')
		}
		addClass(currWord.nextSibling.firstChild,'current')
	}
	// checking if there is any backspace input
	if (isBackspace) {
	    if (extra) {
			// If there is an extra letter present, remove it
			
			const lastletter = extra && currWord.lastChild 
			// console.log("last letter",currWord.lastChild)
			// console.log("last extra letter",lastletter)
	        lastletter.remove();
	    } else {
	        // If there's no extra letter, handle backspace as usual
	        if (currLetter && isFirstLetter) {
	            // make prev word curr and its last letter curr
	            removeClass(currWord, 'current');
	            addClass(currWord.previousSibling, 'current');
	            removeClass(currLetter, 'current');
	            addClass(currWord.previousSibling.lastChild, 'current');
	            removeClass(currWord.previousSibling.lastChild, 'correct');
	            removeClass(currWord.previousSibling.lastChild, 'incorrect');
	        } else if (currLetter && !isFirstLetter) {
	            // move back 1 letter and invalidate the letter
	            removeClass(currLetter, 'current');
	            addClass(currLetter.previousSibling, 'current');
	            removeClass(currLetter.previousSibling, 'correct');
	            removeClass(currLetter.previousSibling, 'incorrect');
	        } else if (!currLetter) {
	            // we are expecting a space, but user inputs backspace
	            addClass(currWord.lastChild, 'current');
	            removeClass(currWord.lastChild, 'correct');
	            removeClass(currWord.lastChild, 'incorrect');
	        }
	    }
	}

	//move lines 
	if (currWord.getBoundingClientRect().top > 200) {
		const words = document.getElementById('words')
		const margin = parseInt(words.style.marginTop || '0px')
		words.style.marginTop = (margin-30) + 'px'
	}
	// move cursor
	const nextLetter = document.querySelector('.letter.current');
	const nextWord = document.querySelector('.word.current');
	const cursor = document.getElementById('cursor');
	cursor.style.top = (nextLetter || nextWord).getBoundingClientRect().top + 2 + 'px';
	cursor.style.left = (nextLetter || nextWord).getBoundingClientRect()[nextLetter ? 'left' : 'right'] + 'px';
})

document.getElementById('newGameBtn').addEventListener('click', () => {
	gameOver();
	newGame();
});
  
newGame()
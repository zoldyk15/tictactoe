$(document).ready(function(){

	const winningCombinations = [
		[
			[0, 4, 8], [0, 3, 6], [0, 1, 2]              // 0
		],
		[
			[1, 4, 7], [1, 0, 2]                         // 1
		],
		[
			[2, 4, 6], [2, 5, 8], [2,0, 1]               // 2
		],
		[
			[3, 0, 6], [3, 4, 5]                         // 3
		],
		[
			[4, 0, 8], [4, 2, 6], [4, 1, 7], [4, 3, 5]   // 4
		],
		[
			[5, 2, 8], [5, 3, 4]                         // 5
		],
		[
			[6, 2, 4], [6, 0, 3], [6, 7, 8]              // 6
		],
		[
			[7, 1, 4], [7, 6, 8]                         // 7
		],
		[
			[8, 0, 4], [8, 2, 5], [8, 6, 7]              // 8
		]
	];

	const emptyBoxes = [0, 1, 2, 3, 4, 5, 6, 7, 8];



	/*
			EVENTS
	*/
	let isCircleMark = true;
	let gameEnded = false;
	let gameType;

	$(document).on("click","button", function(){
		gameType = $(this).attr('game-type');
		$('.modal-bg').fadeOut(500);

		instantiate();
	});

	$(document).on("click",".box",function(){
		if($(this).hasClass('c-mark') || $(this).hasClass('x-mark') || gameEnded){
			return false;
		}

		if(gameType == "player"){
			vsPlayer(this);
		}else{
			vsAI(this);
		}

		
	});


	/*
			GAME TYPE
	*/

	function vsPlayer(that){
		if(isCircleMark){
			$(that).addClass('c-mark');
		}else{
			$(that).addClass('x-mark');
		}

		console.log("before: " + emptyBoxes);
		let position = $(that).attr('position');
		removeEmptySpots(position);
		console.log("after: " + emptyBoxes);
		console.log("====");

		if(checkIfPlayerWins(position)){
			let player = isCircleMark ? "Circle" : "X";
			showResult(player + " Wins!");
			gameEnded = true;
			return false;
		}

		if(emptyBoxes.length == 0){
			showResult("It's a tie!");
			gameEnded = true;
			return false;
		}

		isCircleMark = !isCircleMark;
	}

	function vsAI(that){
		let position;

		$(that).addClass('c-mark');
		position = $(that).attr('position')
		removeEmptySpots(position);
		
		if(checkIfPlayerWins(position)){
			showResult("Circle Wins!");
			gameEnded = true;
			return false;
		}

		isCircleMark = !isCircleMark;

		if(emptyBoxes.length == 0){
			showResult("It's a tie!");
			gameEnded = true;
			return false;
		}


		position = checkCircleWinningCombinations();
		if(checkIfPlayerWins(position)){
			showResult("X Wins!");
			gameEnded = true;
		}

		isCircleMark = !isCircleMark;
	}


	/*
			HELPERS
	*/


	function getWinCombinations(position){
		return winningCombinations[position];
	}

	function checkIfPlayerWins(position){
		let winCombinations = getWinCombinations(position);
		let classValue = isCircleMark ? 'c-mark' : 'x-mark';

		for(let outerCounter = 0; outerCounter < winCombinations.length; outerCounter++){
			let winIndexes = winCombinations[outerCounter];
			
			let innerCounter = 0;
			while(innerCounter < winIndexes.length){
				let index = winIndexes[innerCounter];
				let box = $('.box')[index];
				if(!$(box).hasClass(classValue)){
					break;
				}

				innerCounter++;
			}

			if(innerCounter == winIndexes.length){
				return true;
			}
		}
		return false;
	}

    /* AI - X  */

	function checkCircleWinningCombinations(){
		let breaker = false;
		let fillInIndex;

		for(let mainCounter = 0; mainCounter < winningCombinations.length; mainCounter++){
			
			let winCombinations = winningCombinations[mainCounter];

			for(let outerCounter = 0; outerCounter < winCombinations.length; outerCounter++){
				let winIndexes = winCombinations[outerCounter];
				let winPosition = 0;
				let emptyPosition = 0;

				for(let innerCounter = 0; innerCounter < winIndexes.length; innerCounter++){
					let index = winIndexes[innerCounter];
					let box = $('.box')[index];
					if($(box).hasClass('c-mark')){
						winPosition++;
					}

					if(!$(box).hasClass('c-mark') && !$(box).hasClass('x-mark')){
						emptyPosition++;
					}

				}

				if(winPosition > 1 && emptyPosition == 1){
					fillInIndex = setBlocker(winIndexes);
					breaker = true;
					break;
				}
			}

			if(breaker){
				break;
			}
		}

		// meaning, there's no 2 consecutive circles beside each other with empty spot next
		if(!breaker){
			fillInIndex = fillInXToEmptyBox();
		}

		return fillInIndex;	
	}

	function setBlocker(winIndexes){
		let fillInIndex;

		for(let counter = 0; counter < winIndexes.length;counter++){
			let index = winIndexes[counter];
			let box = $('.box')[index];
			if(!$(box).hasClass('c-mark') && !$(box).hasClass('x-mark')){
				$(box).addClass('x-mark');
				removeEmptySpots(index);
				fillInIndex = index;
				break;
			}
		}
		if(typeof fillInIndex === 'undefined'){
			return fillInXToEmptyBox();
		}

		return fillInIndex;
	}

	function removeEmptySpots(boxIndex){
		let idx = emptyBoxes.findIndex((val) => val == boxIndex);
		emptyBoxes.splice(idx, 1); // remove 1 element starting from idx
	}

	function fillInXToEmptyBox(){
		let index = emptyBoxes[0];
		let box = $('.box')[index];

		$(box).addClass('x-mark');
		removeEmptySpots(index);
		
		return index;
	}

	function showResult(message){
		$(".modal-title").text("Game Over");
		$(".modal-body").text(message + " Play Again?");
		$(".modal-bg").fadeIn(500);
	}

	function instantiate(){
		$('.c-mark').removeClass('c-mark');
		$('.x-mark').removeClass('x-mark');
		isCircleMark = true;
		gameEnded = false;

		clearEmptyBoxes();
		reInitializeEmptyBoxes();			
	}

	function clearEmptyBoxes(){
		while(emptyBoxes.length > 0){
			emptyBoxes.pop();
		}
	}

	function reInitializeEmptyBoxes(){
		for(let position = 0; position < 9; position++){
			emptyBoxes.push(position);
		}
	}

});
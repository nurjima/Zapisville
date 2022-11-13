"use strict"
console.log('engine loaded');

var Engine = function (){
	
    this.turn = function(fromX, fromY, toX, toY){
		gameLevel.swapElements(fromX, fromY, toX, toY);
		playingField = gameLevel.getMap();
		if (!this.canAnnihilate()){
			gameLevel.swapElements(fromX, fromY, toX, toY);
			playingField = gameLevel.getMap();
			return false;
		}
        return this.annihilate();
    }

	function annihilateAll(){
		while (true){
			if (!(this.annihilate())){return;}
		}
	}

	this.getPlayingField = function(){
		return playingField;
	}
	
	this.getScore = function(){
		return score;
	}
	
	this.help = function(){
	let ans;
		for (let i = 0; i < playingField.length; i++){
			for (let j = 0; j < playingField[0].length; j++){
				if (j < playingField[0].length - 1){
					gameLevel.swapElements(i, j, i, j + 1);
					if (this.canAnnihilate()){ans = [[i, j], [i, j + 1]];}
					gameLevel.swapElements(i, j, i, j + 1);
				}
				if (j > 0){
					gameLevel.swapElements(i, j, i, j - 1);
					if (this.canAnnihilate()){ans = [[i, j], [i, j - 1]];}
					gameLevel.swapElements(i, j, i, j -1);
				}
				if (i < playingField.length - 1){
					gameLevel.swapElements(i, j, i + 1, j);
					if (this.canAnnihilate()){ans = [[i, j], [i + 1, j]];}
					gameLevel.swapElements(i, j, i + 1, j);
				}
				if (i > 0){
					gameLevel.swapElements(i, j, i - 1, j);
					if (this.canAnnihilate()){ans = [[i, j], [i - 1, j]];}
					gameLevel.swapElements(i, j, i - 1, j);
				}
				if (ans !== undefined){
					return ans;
				}
			}
		}
		return false;
	}

	this.annihilate = function(){
		let beg;
		let ans = [];
		for (let i = 0; i < playingField.length; i++){
			beg = 0;
			for (let j = 0; j < playingField[0].length; j++){
				if ((playingField[i][j] !== playingField[i][beg]) || (j === playingField[0].length - 1) || (playingField[i][j] === "-1")){
					if (playingField[i][j] === playingField[i][beg]){j++;}
					if (j - beg > 2){
						for (let h = beg; h < j; h++){
							ans.push([i, h, playingField[i][h]]);
						}
					}
					beg = j;
				}
			}
		}
		for (let i = 0; i < playingField[0].length; i++){
			beg = 0;
			for (let j = 0; j < playingField.length; j++){
				if ((playingField[j][i] !== playingField[beg][i]) || (j === playingField.length - 1) || (playingField[j][i] === "-1")){
					if (playingField[j][i] === playingField[beg][i]){j++;}
					if (j - beg > 2){
						for (let h = beg; h < j; h++){
							ans.push([h, i, playingField[h][i]]);
						}
					}
					beg = j;
				}
			}
		}
		for (let i = 0; i < ans.length; i++){
			playingField[ans[i][0]][ans[i][1]] = -3;
		}
		let arr = triggerBombs();
		for (let i = 0; i < arr.length; i++){
			ans.push(arr[i]);
		}
		if (ans.length > 0){
			updateScore(ans);
			updateCollectedGems(ans);
			dropGems(ans);
			if (ans.length > 4){
				doGen(true);
			}
			else{
				doGen(false);
			}
			return ans;
		}
		else{
			return false;
		}
	}
	
	function triggerBombs(){
		let ans = [];
		let buff;
		for (let i = 0; i < playingField.length; i++){
			for (let j = 0; j < playingField[i].length; j++){
				buff = [];
				if (playingField[i][j] === "-1"){
					if (((j > 2) && (playingField[i][j - 1] === -3) && (playingField[i][j - 2] === -3) && (playingField[i][j - 3] === -3)) ||
						((j < playingField[i].length - 3) && (playingField[i][j + 1] === -3) && (playingField[i][j + 2] === -3) && (playingField[i][j + 3] === -3)) || 
							((i > 2) && (playingField[i - 1][j] === -3) && (playingField[i - 2][j] === -3) && (playingField[i - 3][j] === -3)) ||
								((i < playingField.length - 3) && (playingField[i + 1][j] === -3) && (playingField[i + 2][j] === -3) && (playingField[i + 3][j] === -3))){
									buff = explodeBomb(i, j);
					}
				}
				for (let h = 0; h < buff.length; h++){
					ans.push(buff[h]);
				}
			}
		}
		return ans;
	}
	
	function explodeBomb(a, b){
		let ans = [];
		for (let i = a - 1; i < a + 2; i++){
			for (let j = b - 1; j < b + 2; j++){
				if ((i < 0) || (j < 0) || (i >= playingField.length) || (j >= playingField[0].length)){
					continue;
				}
				ans.push([i, j, "-1"]);
				playingField[i][j] = -3;
			}
		}
		return ans;
	}
	
	function updateScore(arr){
		if (gameStatus === 0){return;}
		for (let i = 0; i < arr.length; i++){
			score += Math.floor(5 * (1 + Math.floor((arr[i][2] / gems.length) + 1) / 10));
		}
	}

	this.canAnnihilate = function(){
		let beg;
		for (let i = 0; i < playingField.length; i++){
			beg = 0;
			for (let j = 0; j < playingField[0].length; j++){
				if ((playingField[i][j] !== playingField[i][beg]) || (j === playingField[0].length - 1) || (playingField[i][j] === "-1")){
					if (playingField[i][j] === playingField[i][beg]){j++;}
					if (j - beg > 2){
						return true;
					}
					else{
						beg = j;
					}
				}
			}
		}
		for (let i = 0; i < playingField[0].length; i++){
			beg = 0;
			for (let j = 0; j < playingField.length; j++){
				if ((playingField[j][i] !== playingField[beg][i]) || (j === playingField.length - 1) || (playingField[j][i] === "-1")){
					if (playingField[j][i] === playingField[beg][i]){j++;}
					if (j - beg > 2){
						return true;
					}
					else{
						beg = j;
					}
				}
			}
		}
		return false;
	}

	function dropGems(line){
		let buff;
		for (let i = 0; i < line.length; i++){
			let h = line[i][0];
			let k = line[i][1];
			while ((h > 0) && (playingField[h - 1][k] !== -3)){
				gameLevel.swapElements(h - 1,k,h,k);
				h--;
			}
		}
	}

	function doGen(generateBombs){
		gameLevel.replaceWithGenerated(-3, generateBombs);
        playingField = gameLevel.getMap();
	}
	
	function replaceUpgradedGem(gem){
		for (let i = 0; i < playingField.length; i++){
			for (let j = 0; j < playingField[0].length; j++){
				if (playingField[i][j] === gem){
					playingField[i][j] += gems.length;
				}
			}
		}
	}
	
	function updateCollectedGems(arr){
		if (gameStatus === 0){return;}
		for (let i = 0; i < arr.length; i++){
			gemsCount[arr[i][2] % gems.length]++;
		}
		upgradeGems();
	}
	
	function upgradeGems(){
		for (let i = 0; i < gemsCount.length; i++){
			if ((gemsCount[i] >= gemsTasks[i]) && (Math.floor(gems[i] / gems.length) < 4)){
				replaceUpgradedGem(gems[i]);
				gems[i] += gems.length;
				gemsCount[i] = 0;
			}
		}
	}
	
	this.getGemsStatus = function(){
		let ans = [];
		for (let i = 0; i < gems.length; i++){
			let buff = gemsTasks[i] - gemsCount[i];
			if ((buff < 0) || Math.floor(gems[i] / gems.length) === 4){
				buff = "max"
			}
			ans.push([gems[i], buff]);
		}
		return ans;
	}
	
	this.getTimeTask = function(){
		return timeTask;
	}
	
	this.getScoreTask = function(){
		return scoreTask;
	}

    this.getRows = function () {
        return rows;
    }

    this.getColumns = function () {
        return columns;
    }
	
	this.levelPassed = function(){
		if (score >= scoreTask){
			return true;	
		}
		else{
			return false;
		}
	}
	
	this.getLevelNumber = function(){
		return levelNumber;
	}
	
	this.nextLevel = function(){
		levelNumber++;
		generateLevel.apply(this);
	}
	
	this.replayLevel = function(){
		generateLevel.apply(this);
	}
	
	function generateLevel(){
		gameStatus = 0;
		score = 0;
		gems = [0, 1, 2, 3, 4];
		gemsCount = [0, 0, 0, 0, 0]; 
		gameLevel = new GameLevel(gems, levelNumber);
		gameLevel.generateLevel();
		playingField = gameLevel.getMap();
		gemsTasks = gameLevel.getUpgradeConditions();
		timeTask = gameLevel.getPassTime();
		scoreTask = gameLevel.getPassScore();
        rows = gameLevel.getRows();
        columns = gameLevel.getColumns();
		annihilateAll.apply(this);
		gameStatus = 1;
	}
	
	var levelNumber = 1;
	var gameStatus;
	var score;
	var gems;
	var gemsCount; 
	var gameLevel;
	var playingField;
	var gemsTasks;
	var timeTask;
	var scoreTask;
	var rows;
	var columns;
	generateLevel.apply(this);
}

var engine = new Engine();
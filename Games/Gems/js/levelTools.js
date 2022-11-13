/**
 * Created by Boris on 10.07.2017.
 */
"use strict"

function randomInteger(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
}

function generateWithProbability(elems, achances){
	var p = randomInteger(1,100);
	for (var i = 0; i < achances.length; ++i){
		if (p < achances[i]) return elems[i];
	}
	return elems[0];
}

var GameLevel = function(aelements, difficulty){
	var scoreCoeff = 5;
	var numberOfElements = 5;
	var bomb = '-1';
	var numberOfLevels = 25;
	var chances;
    var elements;
    var rows, columns;
    var map;
	var passScore, passTime;
	var upgradeConditions = new Array(aelements.length);
    setElements(aelements);
    setSize();

	function generateBombs(){
		var p = generateWithProbability([1,0],[20,80]);
		if (p === 1){
			map[Math.floor(randomInteger(0,rows-1))][Math.floor(randomInteger(0,columns-1))] = bomb;
		}
	}
	
	function setUpgradeConditions(){
		for (var i = 0; i < elements.length; ++i){
			if (upgradeConditions[i] === undefined){
				upgradeConditions[i] = Math.floor(randomInteger(0,2)+(4*Math.max(Math.log(difficulty),2))*passTime/150 + Math.log(difficulty)/5);
			}
		}		
	}
	
    function setElements(aelements){
        elements = aelements;
    }

    function setSize(){
        if (difficulty < 3){
            rows = 6;
        } else if (difficulty < 5){
            rows = 8;
        } else if (difficulty < 9){
            rows = 9;
        } else if (difficulty < 13){
            rows = 10;
        } else if (difficulty < 17){
            rows = 11;
        } else {
            rows = 12;
        }
        columns = rows;
        map = new Array(rows);
        for (var i = 0; i < rows; ++i){
            map[i] = new Array(columns);
            for (var j = 0; j < columns; ++j){
                map[i][j] = {};
            }
        }
    }

    this.swapElements = function(fromX, fromY, toX, toY){
        var buff = map[fromX][fromY];
        map[fromX][fromY] = map[toX][toY];
        map[toX][toY] = buff;
    }

    function generateChances() {
        chances = new Array(elements.length);
        chances[0] = 100 / (chances.length) + Math.max(0,(numberOfLevels - difficulty)) / 2;
        chances[1] = 100 / (chances.length) + Math.max(0,(numberOfLevels - difficulty)) / 3;
        for (var i = 2; i < chances.length; ++i) {
            chances[i] = (100 - chances[0] - chances[1]) / (chances.length - 2);
        }
        for (var i = 1; i < chances.length; ++i) {
            chances[i] += chances[i - 1];
        }
    }

    this.generateLevel = function(){
        generateChances();
        for (var i = 0; i < rows; ++i){
            for (var j = 0; j < columns; ++j){
                map[i][j] = generateWithProbability(elements,chances);
            }
        }
		passTime = Math.floor(randomInteger(20, 100));
		passScore = Math.round(passTime*(4.5*Math.max(Math.log(difficulty),0.7)));
		setUpgradeConditions();
		generateBombs();
    }

    this.replaceWithGenerated = function(elementForReplacing, createBomb){
        for (var i = 0; i < map.length; ++i){
            for (var j = 0; j < map[i].length; ++j){
                if (map[i][j] === elementForReplacing){
                    if (createBomb){
                        map[i][j] = bomb;
						createBomb = 0;
                        continue;
                    }
                    map[i][j] = generateWithProbability(elements,chances);
                }
            }
        }
    }
	
	this.getUpgradeConditions = function(){
		return (upgradeConditions);
	}
	
	this.getPassTime = function(){
		return (passTime);
	}
	
	this.getPassScore = function(){
		return (passScore);
	}	

    this.getMap = function(){
        return(map);
    }

    this.getRows = function () {
        return rows;
    }

    this.getColumns = function () {
        return columns;
    }
}

/* usage example */

/*
 var myGen = new GameLevel(['a','b','c','d','e'],5,5,1);
 myGen.generateLevel();
 myGen.replaceWithGenerated('b');
 var myLevel = myGen.getMap();
 console.log(myLevel);
 console.log(generateWithProbability(['a','b','c'],[10,50,40]));
 */
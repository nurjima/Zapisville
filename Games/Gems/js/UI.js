"use strict"

$(window).on("load", function(){
    console.log('UI loaded')
    const WIN_TEXT = '<span>Level passed!</span>';
    const LOOSE_TEXT = '<span>You lost!</span>';

    const BTN_WIN_TEXT = 'Continue';
    const BTN_LOOSE_TEXT = 'Retry';

    const CELL_SIZE = 64;

    const FALL_TIME = 500;
    const SWAP_TIME = 400;
    const BOOM_TIME = 500;

    const GAME_TIMEOUT  = 0;
    const GAME_PLAYING = 1;
    const GAME_END = 2;

    const DEBUG_TIME = 5000;

    var Game = function () {
        var that = this;
        this.menu = $('#menu');
        this.helpBtn = $('#help');
        this.helpBtn.click(function() {
            that.helpTurn();
        });
        this.initialize(false);
    };

    Game.prototype.helpTurn = function(){
        var gT = engine.help();
        var cell1 =  this.gameGrid.find('#'+gT[0][0]+'-'+gT[0][1]);
        var cell2 =  this.gameGrid.find('#'+gT[1][0]+'-'+gT[1][1]);
        this.swapCells(cell1, cell2);
    };

    Game.prototype.initialize = function(isNext){
        if (!this.level) {
            //nothing
        }
        else if(isNext) {
            engine.nextLevel();
        }
        else {
            engine.replayLevel();
        }

        this.isSwap1InProgress = false;
        this.isSwap2InProgress = false;
        this.isUIBlocked = false;
        this.isExectuted = false;

        this.gameGrid = $('#game-grid');
        this.statusBox = $('#gem-upgrade-box');
        this.timer = $("#progress");

        this.level = engine.getPlayingField();
        this.GAME_GRID_WIDTH = engine.getColumns();
        this.GAME_GRID_HEIGHT = engine.getRows();
        this.gameState = GAME_PLAYING;
        //create game grid
        this.requiredScore = engine.getScoreTask();
        this.levelEndTime = new Date().getTime() + engine.getTimeTask() * 1000;

        $("#game").css({
            'width': CELL_SIZE * this.GAME_GRID_WIDTH + 'px',
            'height': CELL_SIZE * this.GAME_GRID_HEIGHT + 'px'
        });

        $(this.timer).css('width', CELL_SIZE * this.GAME_GRID_WIDTH + 'px');
        $('#gem-upgrade-box').css('width', CELL_SIZE * this.GAME_GRID_WIDTH + 'px');

        this.createTimer();
        this.updateStatusBox();
        this.updateScore();
        this.createGrid();
    };

    Game.prototype.isAnimationInProgress = function(argument){
        return (this.isSwap1InProgress || this.isSwap2InProgress || this.isUIBlocked);
    };


    Game.prototype.createGrid = function(){
        var that = this;
        this.level = engine.getPlayingField();
        this.gameGrid.empty();

        for (let i = 0; i < this.GAME_GRID_HEIGHT; ++i) {
            for (let j = 0; j < this.GAME_GRID_WIDTH; ++j) {
                var id = i + '-' + j;
                if (this.level[i][j] === '-1'){
                    var cell = $('<div id="' + id +'" class="game-cell"><img src="img/bomb.png"></div>');
                }
                else {
                    var cell = $('<div id="' + id +'" class="game-cell"><img src="img/diamond-' + this.level[i][j] + '.png"></div>');
                }

                cell.appendTo(this.gameGrid).click({game: this}, function(e) {
                    e.data.game.userClick($(this));
                }).on('dragstart', function(event) {
                    event.preventDefault();
                    that.userClick($(this));
                });
            }
        }
    };

    Game.prototype.updateOnce = function(callback){
        if(!this.isExectuted) {
            this.isExectuted = true;
            callback();
        }
    };

    Game.prototype.redrawGrid = function(){
        var that = this;

        for (let i = 0; i < this.GAME_GRID_HEIGHT; ++i) {
            for (let j = 0; j < this.GAME_GRID_WIDTH; ++j) {
                var id = i + '-' + j;
                if (this.level[i][j] === '-1'){
                    this.gameGrid.find('#'+id).removeClass('destroyed').removeClass('bombed').find('img').attr('src', 'img/bomb.png')
                }
                else {
                    this.gameGrid.find('#'+id).removeClass('destroyed').removeClass('bombed').find('img').attr('src', 'img/diamond-' + this.level[i][j] + '.png')
                }
            }
        }

        that.updateStatusBox();
        var nexAnnihilate = engine.annihilate();

        that.isExectuted = false;
        this.gameGrid.find('img').animate({
            'top': 0,
            'left': 0},
            FALL_TIME, function() {
            that.updateOnce(function() {that.updateLevel(nexAnnihilate);});
        });
    }


    Game.prototype.updateLevel = function(destroyed){
        this.updateScore();
        if (this.gameState === GAME_END) {
            return;
        }
        this.animateDestruction(destroyed);

        if(engine.levelPassed()) {
             this.endGame();
             return;
        }
    };

    Game.prototype.userClick = function(cell){
        if (this.isAnimationInProgress() || this.gameState !== GAME_PLAYING) {
            return;
        }

        var prevSelCell = this.gameGrid.find(".selected-cell").first();
        cell.addClass('selected-cell');
        if (prevSelCell.length) {
            this.gameGrid.children().removeClass('selected-cell');
            this.swapCells(prevSelCell, cell);
        }
    };

    Game.prototype.swapEndCallback = function(callback){
        if (!this.isSwap1InProgress && !this.isSwap2InProgress) {
            callback();
        }
    };

    Game.prototype.animateSwap = function(cell1, cell2, id1, id2, callback){
        var that = this;

        var cell1Img = cell1.find('img');
        var cell2Img = cell2.find('img');

        var cell1ImgPath = cell1Img.attr('src');
        var cell2ImgPath = cell2Img.attr('src');

        cell1Img.css('z-index', 1000);
        cell2Img.css('z-index', 1000);


        cell1Img.animate({
            'top': CELL_SIZE * (id2[0]-id1[0]) + 'px',
            'left': CELL_SIZE * (id2[1]-id1[1]) + 'px'},
            SWAP_TIME, function() {
                cell1Img.css({'top': 0, 'left': 0, 'z-index': 100}).attr('src', cell2ImgPath);
                that.isSwap1InProgress = false;
                that.swapEndCallback(callback);
        });

        cell2Img.animate({
            'top': CELL_SIZE * (id1[0]-id2[0]) + 'px',
            'left': CELL_SIZE * (id1[1]-id2[1]) + 'px'},
            SWAP_TIME, function() {
                cell2Img.css({'top': 0, 'left': 0, 'z-index': 100}).attr('src', cell1ImgPath);
                that.isSwap2InProgress = false;
                that.swapEndCallback(callback);
        });
    }

    Game.prototype.swapCells = function(cell1, cell2) {
        var that = this;

        if (this.isUIBlocked) {
            return;
        }

        this.isUIBlocked = true;
        that.isSwap1InProgress = true;
        that.isSwap2InProgress = true;

        var id1 = cell1.attr('id').split('-');
        var id2 = cell2.attr('id').split('-');

        if (!((Math.abs(id2[0]-id1[0]) === 1 && id2[1] === id1[1]) ||  (Math.abs(id2[1]-id1[1]) === 1 && id2[0] === id1[0]))) {
            cell2.addClass('selected-cell');
                that.isUIBlocked = false;
                that.isSwap1InProgress = false;
                that.isSwap2InProgress = false;
            return;
        }

        var nextDestroy = engine.turn(id1[0], id1[1], id2[0], id2[1]);

        this.animateSwap(cell1, cell2, id1, id2, function() {
			if (nextDestroy) {
				that.updateLevel(nextDestroy);
            }
            else {
                that.animateSwap(cell1, cell2, id1, id2, function(){that.updateLevel(false)});
			}
		});

    };

    Game.prototype.animateDestruction = function(gems){
        var that = this;
        if (!gems) {
            this.isUIBlocked = false;
            if (engine.levelPassed() && that.gameState !== GAME_END) {
                this.endGame();
            }
            return;
		}

        var isBomb = false;
        gems.forEach(function(gem, index, array) {
            if (gem[2] === '-1') {
                isBomb = true;
                that.gameGrid.find('#'+gem[0]+'-'+gem[1]).removeClass('destroyed').addClass('bombed').find('img').attr('src', 'img/boom.png');
            }
            else {
               that.gameGrid.find('#'+gem[0]+'-'+gem[1]).addClass('destroyed');
            }
        });

        if (isBomb) {
            music.playBomb();
        }
        else {
            music.playPop();
        }
        that.boomTimeOut =  setTimeout(function() {
            that.destroyGems();
        }, BOOM_TIME);

    };

    Game.prototype.destroyGems = function() {
        var that = this;

        for (let j = 0; j < that.level[0].length; ++j) {
            let destCount = 0;
            for (var i = that.level.length - 1; i >= 0; --i) {
                let gemImg = $('#' + i + '-' + j);
                if (gemImg.hasClass('destroyed') || gemImg.hasClass('bombed')) {
                    destCount++;
                }
                if(destCount > 0) {
                    that.riseCell($('#'+(i+destCount-1) + '-' + j + ' img'), destCount);
                }
            }
            for (let k = i+destCount-1; k >= 0; --k) {
                that.riseCell($('#'+k+'-' + j + ' img'), destCount);
            }
        }

        this.redrawGrid();
    };

    Game.prototype.riseCell = function(gemImg, height) {
        gemImg.css('top', -1 * CELL_SIZE * height + 'px');
    };

    Game.prototype.updateStatusBox = function(){
        var that = this;
        that.statusBox.find('.gem-status').remove();
        engine.getGemsStatus().forEach(function(elem) {
            $('<div id="s-' + elem[0] + '" class="gem-status"><img src="img/diamond-'+ elem[0] +'.png">:' + elem[1] +'</div>').appendTo(that.statusBox);
        });
    };

    Game.prototype.createTimer = function(){
        var that = this;

        that.timer.find('#bar').css('width', '100%').animate({
            'width': '0px'},
            that.levelEndTime - new Date().getTime(), 'linear', function() {
                that.timeEnd();
        });
    };

    Game.prototype.timeEnd = function(){
        if(this.gameState === GAME_END) {
            return;
        }
        var that = this;
        that.gameState = GAME_TIMEOUT;
        that.endGame();
    };

    Game.prototype.endGame = function(){
        if (this.gameState === GAME_END) {
            return;
        }
        var that = this;
        that.gameState = GAME_END;
        clearTimeout(that.boomTimeOut);
        that.timer.find('#bar').stop(true, false);
        that.showMenu(engine.levelPassed());
    };

    Game.prototype.showMenu = function(isWin){
        var that = this;
        var resultText = isWin ? WIN_TEXT : LOOSE_TEXT;
        var btnText = isWin ? BTN_WIN_TEXT : BTN_LOOSE_TEXT;

        var resultDiv = $('<div id="result-text">' + resultText + '</div>');
        var button = $('<button id="restart-btn">' + btnText + '</btn>');

        resultDiv.addClass(isWin ? 'win' : 'loose');

        $('#game-result').empty().append(resultDiv).append(button);

        this.menu.animate({top:'50%'}, 400);
        $('#restart-btn').one('click', function(){
            that.hideMenu();
            that.initialize(isWin);
        });
    };

	Game.prototype.hideMenu = function(){
		this.menu.animate({top:'-208px'}, 400);
	};

    Game.prototype.updateScore = function(){
        $('#score-box').text(engine.getScore() + '/' + this.requiredScore + ' lvl №'+engine.getLevelNumber());
    };



    var Music = function() {
		var that = this;
        this.bg = $('#music');
        this.pop = $("#pop");
        this.bomb = $("#bomb");

        this.bg.prop('volume', 0.1);
        this.pop.prop('volume',0.7);
        this.bomb.prop('volume', 0.7);
        that.bg.trigger('play');

        $('#play-music').click(function() {
            return window.location.href = "/Users/sabi/Downloads/Zapisville/index.html";
        });

    };

    Music.prototype.playBomb = function(){
        this.bomb.trigger('play');
    };

    Music.prototype.playPop = function(){
        this.pop.trigger('play');
    };

    var music = new Music();
    var game = new Game();

});

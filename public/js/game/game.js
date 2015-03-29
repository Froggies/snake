import {DrawableUtil} from './drawableUtil';
import {GameBoard} from './entities/gameBoard';
import {Snake} from './entities/snake';
import {Food} from './entities/food';
import {KeyboardController} from './controllers/keyboardController';
import {IAController} from './controllers/iAController';
import {RemoteNetworkController} from './controllers/remoteNetworkController';
import {CONFIG} from '../../../shared/entityCst';

export class Game {
    constructor(options) {
        let nbFood = options.nbFood;
        let controllers = options.controllers;
        let snakeInitSize = options.snakeInitSize;
        let isInfiniteWallSize = options.infiniteWallSize;
        let callbacks = options.callbacks;

        this.isStarted = false;
        this.isFinish = false;
        this.controllers = [];

        var canvas = document.getElementById('canvas');
        canvas.setAttribute('width', CONFIG.GAME_BOARD.width);
        canvas.setAttribute('height', CONFIG.GAME_BOARD.height);
        this.drawableUtil = new DrawableUtil(canvas.getContext("2d"));
        this.gameBoard = new GameBoard(callbacks);

        for(let {type, color, id, initPosition} of controllers) {
            let snake = new Snake({id, snakeInitSize, initPosition, color, isInfiniteWallSize}, this.gameBoard);
            this.gameBoard.addEntity(snake);
            if (type === 'KeyboardController') {
                snake.isLocal = true;
                this.controllers.push(new KeyboardController(snake));
            } else if (type === 'IAController') {
                snake.isLocal = true;
                this.controllers.push(new IAController(snake, this.gameBoard));
            } else if(type === 'RemoteNetworkController') {
                snake.isLocal = false;
                this.controllers.push(new RemoteNetworkController(snake, this));
            } else {
                throw new Error('Unknown controller', type);
            }
        }

        for(let i=0; i<nbFood; i++) {
            this.gameBoard.addEntity(new Food(this.gameBoard));
        }
    }

    run() {
        this.isStarted = true;
        if(this.intervalId === undefined) {
            this.intervalId = setInterval(this.step.bind(this), 60);
        }
    }

    step() {
        this.gameBoard.move();
        let atLeastOneDead = this.gameBoard.checkCollision();
        if (this.isFinish || (atLeastOneDead && this.gameBoard.nbMovableEntitiesInGame() <= 1)) {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = undefined;
                this.isStarted = false;
            }
            this.isFinish = true;
        }
    }

    draw() {
        var loop = () => {
            window.requestAnimationFrame(() => {
                this.gameBoard.draw(this.drawableUtil);
                if(this.isFinish === false) {
                    loop();
                }
            });
        };
        loop();
    }

    addFood(optProperties) {
        this.gameBoard.addEntity(new Food(this.gameBoard, optProperties));
    }

    destroy() {
        this.controllers.forEach((controller) => {
            controller.destroy();
        });
    }

}
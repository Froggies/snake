/**
 * Created by manland on 20/03/15.
 */
import {Game} from './game';
var lib = require('./lib');

document.onkeypress = lib.onKeyDown;
document.onkeydown = lib.onKeyDown;

setTimeout(function() {
    new Game().gamerun();
}, 3000);
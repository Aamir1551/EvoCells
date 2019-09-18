"use strict";
exports.__esModule = true;
var cell_1 = require("./cell");
var Environment = /** @class */ (function () {
    function Environment(numCells, canvas) {
        this.numCells = numCells;
        this.canvas = canvas;
        this.cells = [];
        console.log("Creating environment");
        for (var i = 0; i < numCells; i++) {
            this.cells.push(new cell_1.Cell([Math.random(), Math.random(), Math.random()], Math.random(), Math.random(), Math.random()));
        }
    }
    Environment.prototype.addFoodToPlace = function () {
    };
    Environment.prototype.detectCollisions = function () {
        var crashes;
        for (var i = 0; i < this.cells.length - 1; i++) {
            for (var j = i + 1; j < this.cells.length; j++) {
                if (Math.pow(this.cells[i].position[0] - this.cells[j].position[0], 2) + Math.pow(this.cells[i].position[1] - this.cells[j].position[1], 2) < Math.pow(this.cells[i].size + this.cells[j].size, 2)) {
                    //weve touched
                    crashes.push([this.cells[i], this.cells[j]]);
                }
            }
        }
        return crashes;
    };
    Environment.prototype.iterate = function () {
        console.log("l");
        var cellCollisions = this.detectCollisions();
        for (var i = 0; i < this.cells.length; i++) {
            this.cells[i].move();
            this.cells[i].draw(this.canvas);
            if (this.cells[i].getProteinValue() > 20) {
                //split
            }
            if (!this.cells[i].isAlive) {
                this.cells.splice(i);
                i--;
            }
        }
        for (var i = 0; i < cellCollisions.length; i++) {
            cell_1.Cell.fight(cellCollisions[i][0], cellCollisions[i][1]);
        }
    };
    return Environment;
}());
function start() {
    console.log("p");
    var canvas = document.getElementsByTagName("canvas")[0];
    console.log(canvas);
    var petri = new Environment(10, canvas);
    console.log(22);
    for (var i = 0; i < 10; i++) {
        petri.iterate();
        console.log("h"); //put wait
    }
}
console.log(1);
start();

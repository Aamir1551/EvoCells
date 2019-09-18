"use strict";
exports.__esModule = true;
var Cell = /** @class */ (function () {
    function Cell(DNA, strength, size, speed) {
        if (strength === void 0) { strength = 0.2; }
        if (size === void 0) { size = 10; }
        if (speed === void 0) { speed = 5; }
        this.DNA = DNA;
        this.strength = strength;
        this.size = size;
        this.speed = speed;
        this.foodCollected = 0;
        this.isAlive = true;
        this.covered = 1;
    }
    Cell.prototype.useEnergy = function () {
        var t = (this.speed + this.strength + this.size);
        var c = this.foodCollected / t;
        this.strength += this.DNA[0] * c;
        this.size += this.DNA[1] * c;
        this.speed += this.DNA[2] * c;
    };
    Cell.prototype.eatCell = function (otherCell) {
        if (this.strength > otherCell.strength && this.size > otherCell.size * 1.1) {
            var p = otherCell.getProteinValue();
            this.foodCollected += p;
            otherCell.isAlive = false;
            return true;
        }
        return false;
    };
    Cell.prototype.draw = function (canvas) {
        canvas.getContext("2d").beginPath();
        canvas.getContext("2d").arc(this.position[0], this.position[1], this.size, 0, 2 * Math.PI);
        canvas.getContext("2d").stroke();
    };
    Cell.fight = function (cell1, cell2) {
        cell1.strength > cell2.strength ? cell1.eatCell(cell2) : cell2.eatCell(cell1);
    };
    Cell.prototype.getProteinValue = function () {
        return this.strength + this.size;
    };
    Cell.bezierCurve = function (p0, p1, p2, p3, t) {
        return [Cell.bezierCurveX(p0[0], p1[0], p2[0], p3[0], t), Cell.bezierCurveX(p0[1], p1[1], p2[1], p3[1], t)];
    };
    Cell.bezierCurveX = function (p0, p1, p2, p3, t) {
        return Math.pow(1 - t, 3) * p0 + 3 * t * Math.pow(1 - t, 2) * p1 + 3 * t * t * (1 - t) * p2 + t ^ 3 * p3;
    };
    Cell.prototype.move = function () {
        if (this.covered = 1) {
            //pick new bezierpoints
            this.p0 = [Math.random(), Math.random()];
            this.p1 = [Math.random(), Math.random()];
            this.p2 = [Math.random(), Math.random()];
            this.p3 = [Math.random(), Math.random()];
        }
        this.covered += 0.1;
        this.position = Cell.bezierCurve(this.p0, this.p1, this.p2, this.p3, this.covered * this.speed);
    };
    return Cell;
}());
exports.Cell = Cell;

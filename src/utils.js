/* src/utils.js
 *
 * FancyTiling - GNOME extension
 * Copyright (C) 2024  DevRoamer <d3vr0am3r@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class Rectangle {
    constructor(x, y, width, height) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._right = x + width;
        this._bottom = y + height;
    }

    getX() {
        return this._x;
    }
    getY() {
        return this._y;
    }
    getWidth() {
        return this._width;
    }
    getHeight() {
        return this._height;
    }

    getTop() {
        return this._x;
    }
    getLeft() {
        return this._y;
    }
    getRight() {
        return this._right;
    }
    getBottom() {
        return this._bottom;
    }

    isEmpty() {
        return this._width <= 0 || this._height <= 0;
    }

    contains(x, y) {
        return this._x <= x && this._y <= y && this._right > x && this._bottom > y;
    }

    /*
     * @param {Rectangle} other
     */
    intersects(other) {
        return (
            this.contains(other.getX(), other.getY()) ||
            this.contains(other.getRight(), other.getY()) ||
            this.contains(other.getRight(), other.getBottom()) ||
            this.contains(other.getX(), other.getBottom())
        );
    }

    toString() {
        return `Rectangle[isEmpty: ${this.isEmpty}, x: ${this._x}, y: ${this._y}, width: ${this._width}, height: ${this._height}]`;
    }

    /*
     * @param {Rectangle} a
     * @param {Rectangle} b
     */
    static combine(a, b) {
        return this.fromLTRB(
            Math.min(a.x, b.x),
            Math.min(a.y, b.y),
            Math.max(a.right, b.right),
            Math.max(a.bottom, b.bottom)
        );
    }

    static fromLTRB(left, top, right, bottom) {
        return new Rectangle(left, top, right - left, bottom - top);
    }
}

export function getDisplayClientAreaRect(display) {
    let x1 = 0,
        y1 = 0,
        x2 = display.get_size()[0],
        y2 = display.get_size()[1];
    let panelBounds = new Rectangle(
        Main.panel.get_x(),
        Main.panel.get_y(),
        Main.panel.get_width(),
        Main.panel.get_height()
    );

    if (panelBounds.getWidth() < panelBounds.getHeight()) {
        // vertical
        if (panelBounds.getX() <= 0) {
            // left
            x1 = panelBounds.getRight();
        } else {
            x2 = panelBounds.getX();
        }
    } else {
        // horizontal
        if (panelBounds.getY() <= 0) {
            y1 = panelBounds.getBottom();
        } else {
            y2 = panelBounds.getBottom();
        }
    }

    return Rectangle.fromLTRB(x1, y1, x2, y2);
}

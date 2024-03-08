/* src/layout.js
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

import FtObject from './ftobject.js';
import { Rectangle } from './utils.js';

// #region ZoneLayoutManager

// #endregion

// #region ZoneLayout

class ZoneLayout extends FtObject {
    constructor(displayRect, mergeDistance, name, json) {
        super();
        this._name = name;
        this._mergeDistance = mergeDistance;
        this._zones = [];
        this._loadLayout(displayRect, json);
    }

    getName() {
        return this._name;
    }
    getZoneCount() {
        return this._zones.length;
    }

    getZoneRectangleAt(x, y) {
        let rect = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MIN_VALUE, Number.MIN_VALUE];
        let mouseRect = new Rectangle(
            x - this._mergeDistance,
            y - this._mergeDistance,
            this._mergeDistance * 2,
            this._mergeDistance * 2
        );
        for (let zone of this._zones) {
            if (zone.rectangle.intersects(mouseRect)) {
                rect[0] = Math.min(rect[0], zone.getRectangle().getX());
                rect[1] = Math.min(rect[1], zone.getRectangle().getY());
                rect[2] = Math.max(rect[2], zone.getRectangle().getRight());
                rect[3] = Math.max(rect[3], zone.getRectangle().getBottom());
            }
        }
        let result = Rectangle.fromLTRB(rect[0], rect[1], rect[2], rect[3]);
        return result.isEmpty() ? null : result;
    }

    _loadLayout(displayRect, json) {
        for (let zoneName in json['zones']) {
            let zoneVerts = json['zones'][zoneName];
            this._zones.push(
                new Zone(
                    zone,
                    Rectangle.fromLTRB(
                        zoneVerts[0] * displayRect.getWidth() + displayRect.getX(),
                        zoneVerts[1] * displayRect.getHeight() + displayRect.getY(),
                        zoneVerts[2] * displayRect.getWidth() + displayRect.getX(),
                        zoneVerts[3] * displayRect.getHeight() + displayRect.getY()
                    )
                )
            );
        }
    }
}

// #endregion ZoneLayout

// #region Zone

export class Zone {
    constructor(name, rectangle) {
        this._name = name;
        this._rectangle = rectangle;
    }

    getRectangle() {
        return this._rectangle;
    }

    getName() {
        return this._name;
    }
}

// #endregion Zone

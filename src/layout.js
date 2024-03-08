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
import FtSettings from './settings.js';
import { Rectangle, getDisplayClientAreaRect } from './utils.js';

// #region ZoneLayoutManager

/*
 * Signals:
 *   changed::active-layout
 *   layout-added
 *   layout-removed
 *
 */
export default class ZoneLayoutManager extends FtObject {
    constructor(display) {
        super();
        this._displayRect = getDisplayClientAreaRect(display);
        this._activeLayout = null;
        this._layouts = [];
    }

    getActiveLayout() {
        return this._activeLayout;
    }

    setActiveLayout(layout) {
        if (this._activeLayout === layout) {
            return;
        }

        this._activeLayout = layout;
        this.emit('changed::active-layout', this);
    }

    getLayouts() {
        return this._layouts;
    }

    loadLayouts() {
        log('Loading zone layouts');
        this._layouts = [];
        this._activeLayout = null;
        let zoneSnap = FtSettings.getZoneSnap();
        let jsonStr = FtSettings.getLayouts();
        if (jsonStr) {
            let json = JSON.parse(jsonStr);
            for (let layoutName in json['layouts']) {
                let layout = new ZoneLayout(this._displayRect, zoneSnap, layoutName, json['layouts'][layoutName]);
                this.addLayout(layout);
                log(`Added layout ${layout.getName()}`);
            }
        }

        let defaultLayout = this.findLayout(FtSettings.getDefaultLayout());
        if (defaultLayout != null) {
            this._activeLayout = defaultLayout;
        } else if (defaultLayout == null && this._layouts.length > 0) {
            this.activeLayout = this._layouts[0];
        }
    }

    addLayout(layout) {
        this._layouts.push(layout);
        this.emit('layout-added', this, layout);
    }

    removeLayout(layout) {
        for (let i in this._layouts) {
            if (this._layouts[i] === layout) {
                this._layouts.splice(parseInt(i), 1);
                this.emit('layout-removed', this, layout);
                return true;
            }
        }

        return false;
    }

    findLayout(name) {
        for (let layout of this._layouts) {
            if (layout.name === name) {
                return layout;
            }
        }

        return null;
    }

    destroy() {
        this._layouts.forEach((l) => l.destroy());
        this._layouts = [];
        this._activeLayout = null;
        super.destroy();
    }
}

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
                    zoneName,
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

/* src/observers.js
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

// #region DisplayObserver

export class DisplayObserver {
    constructor(display) {
        this._display = display;
        this._init();
    }

    _init() {
        this._windowCreatedHandler = this._display.connect("window-created", (display, win) => {
            console.log("NEW WIN", win);
        });
    }

    destroy() {
        this._display.disconnect(this._windowCreatedHandler);
        this._display = null;
    }

    _findActorForWindowId(id) {
       return null;
    }
}

// #endregion DisplayObserver

// #region WindowObserver

export class WindowObserver {
    constructor(window, actor) {
        this._window = window;
        this._actor = actor;
    }
}

// #endregion WindowObserver
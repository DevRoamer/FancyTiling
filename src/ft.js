/* src/ft.js
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

import { DisplayObserver } from "./observers.js";

// #region FancyTiling

export default class FancyTiling {
    constructor(extension) {
        this._extension = extension;
        this._displayObserver = new DisplayObserver(global.display);
    }

    destor() {
        this._displayObserver?.destroy();
        this._displayObserver = null;
        this._extension = null;
    }
}

// #endregion FancyTiling

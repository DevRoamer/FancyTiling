/* src/ftobject.js
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

export default class FtObject {
    _handlers = {};
    _handlerCount = 0;

    connect(sigName, callback) {
        if (!(sigName in this._handlers)) {
            this._handlers[sigName] = [];
        }

        let id = this._handlerCount++;
        this._handlers[sigName].push({ id: id, callback: callback });
        return id;
    }

    disconnect(id) {
        for (let sigName in this._handlers) {
            for (let i in this._handlers[sigName]) {
                if (this._handlers[sigName][i].id === id) {
                    this._handlers[sigName].splice(parseInt(i), 1);
                    return;
                }
            }
        }
    }

    emit(sigName, ...args) {
        if (!(sigName in this._handlers)) {
            return;
        }

        for (let info of this._handlers[sigName]) {
            info.callback(...args);
        }
    }

    destroy() {
        this._handlers = {};
        this._handlerCount = 0;
    }
}

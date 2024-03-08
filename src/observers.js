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

import Meta from 'gi://Meta';
import FtObject from './ftobject.js';
import ZoneLayoutManager from './layout.js';

// #region DisplayObserver

export class DisplayObserver extends FtObject {
    constructor(display) {
        super();
        this._display = display;
        this._windowOberservers = [];
        this._layoutManager = new ZoneLayoutManager(display);
        this._initObserver();
    }

    _initObserver() {
        this._handleWindowCreated = this._handleWindowCreated.bind(this);
        this._windowCreatedHandler = this._display.connect('window-created', this._handleWindowCreated);
        this._handleObserverWindowDestroyed = this._handleObserverWindowDestroyed.bind(this);
        this._handleObserverWindowDrag = this._handleObserverWindowDrag.bind(this);

        this._layoutManager.loadLayouts();
    }

    destroy() {
        this._windowOberservers.forEach((o) => this._removeWindowObserver(o));
        this._display.disconnect(this._windowCreatedHandler);
        this._display = null;
        this._layoutManager.destroy();
        this._layoutManager = null;
        super.destroy();
    }

    _handleWindowCreated(display, window) {
        this._createWindowObserver(window);
    }

    _handleObserverWindowDestroyed(observer) {
        this._removeWindowObserver(observer);
    }

    _handleObserverWindowDrag(observer) {}

    _createWindowObserver(win) {
        let actor = this._findActorForWindowId(win.get_id());
        if (!actor) {
            logError(`could not find window actor for window id ${win.get_id()}`);
            return;
        }

        let observer = new WindowObserver(win, actor);
        this._windowOberservers.push({
            windowId: win.get_id(),
            observer: observer,
            handlerDestroy: observer.connect('window-destroyed', this._handleObserverWindowDestroyed),
            handlerDrag: observer.connect('window-drag', this._handleObserverWindowDrag),
        });
        log(`Created window observer for window (${win.get_id()})`);
    }

    _removeWindowObserver(observer) {
        log(`Try to remove window observer for window (${observer.getWindowId()})`);

        for (let i in this._windowOberservers) {
            let info = this._windowOberservers[i];
            if (info.windowId === observer.getWindowId()) {
                info.observer.disconnect(info.handlerDestroy);
                info.observer.disconnect(info.handlerDrag);
                info.observer = null;
                this._windowOberservers.splice(parseInt(i), 1);
                log('success.');
                return;
            }
        }

        log(`No window observer found for window (${win.get_id()})`);
    }

    _findActorForWindowId(id) {
        let actors = Meta.get_window_actors(this._display);
        for (let actor of actors) {
            if (actor.get_meta_window().get_id() === id) {
                return actor;
            }
        }

        return null;
    }
}

// #endregion DisplayObserver

// #region WindowObserver

export class WindowObserver extends FtObject {
    constructor(window, actor) {
        super();
        this._window = window;
        this._actor = actor;
        this._id = window.get_id();
        this._initObserver();
    }

    getActor() {
        return this._actor;
    }
    getWindow() {
        return this._window;
    }
    getWindowId() {
        return this._id;
    }

    destroy() {
        this.__destroy(false);
    }

    _initObserver() {
        this._handleActorDestroy = this._handleActorDestroy.bind(this);
        this._handleWindowPosChanged = this._handleWindowPosChanged.bind(this);

        this._handlerWindowPosChanged = this._window.connect('position-changed', this._handleWindowPosChanged);
        this._handlerActorDestroy = this._actor.connect('destroy', this._handleActorDestroy);
    }

    _handleWindowPosChanged(args) {
        this.emit('window-drag', this);
    }

    _handleActorDestroy(args) {
        this.__destroy(true);
    }

    __destroy(emit) {
        if (emit) {
            this.emit('window-destroyed', this);
        }
        this._window?.disconnect(this._handlerWindowPosChanged);
        this._window = null;
        this._actor?.disconnect(this._handlerActorDestroy);
        this._actor = null;
        this._id = null;
        super.destroy();
    }
}

// #endregion WindowObserver

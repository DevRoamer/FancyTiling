/* src/selector.js
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

import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import FtObject from './ftobject.js';
import FtSettings from './settings.js';
import { Rectangle } from './utils.js';

export class ZoneSelector extends FtObject {
    constructor(layout, windowObserver) {
        super();
        this._observer = windowObserver;
        this._layout = layout;
        this._cancelRequested = false;
        this._zoneActor = new ZoneActor();
        this._seat = Clutter.get_default_backend().get_default_seat();
    }

    run() {
        global.stage.add_child(this._zoneActor);
        this._handlerInterval = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 10, () => {
            if (!this._cancelRequested && !this._update()) {
                return GLib.SOURCE_CONTINUE;
            }
            this.stop();
            return GLib.SOURCE_REMOVE;
        });
    }

    stop() {
        if (this._cancelRequested) {
            return;
        }

        global.stage.remove_child(this._zoneActor);
        this._cancelRequested = true;
        if (this._handlerInterval) {
            GLib.source_remove(this._handlerInterval);
            this._handlerInterval = null;
        }

        this.emit('finished', this);
    }

    destory() {
        this.stop();
        this._zoneActor?.destroy();
        this._zoneActor = null;
        super.destroy();
    }

    _update() {
        let [, mousePos, mouseMod] = this._seat.query_state(this._seat.get_pointer(), null);
        let [, , keyboardMod] = this._seat.query_state(this._seat.get_keyboard(), null);

        let btnDown = (mouseMod & Clutter.ModifierType.BUTTON1_MASK) != 0;
        let keyDown = (keyboardMod & Clutter.ModifierType.CONTROL_MASK) != 0;
        let rect = null;

        if (btnDown) {
            if (keyDown) {
                rect = this._layout.getZoneRectangleAt(mousePos.x, mousePos.y);
            } else {
                rect = null;
            }
        } else {
            if (keyDown) {
                this._onZoneSelected();
            }
            return true;
        }

        if (rect != null) {
            this._showZoneActor(rect);
        } else {
            this._hideZoneActor();
        }

        this._rect = rect;
        return false;
    }

    _onZoneSelected() {
        if (this._rect == null) {
            return;
        }

        try {
            let window = this._observer.getWindow();
            let windowActor = this._observer.getActor();

            if (FtSettings.isAnimated) {
                windowActor.remove_all_transitions();
                Main.wm._prepareAnimationInfo(
                    global.window_manager,
                    windowActor,
                    window.get_frame_rect().copy(),
                    Meta.SizeChange.MAXIMIZE
                );
            }
            let rect = this._zoneActor.getRectangle();
            window.move_frame(true, rect.getX(), rect.getY());
            window.move_resize_frame(true, rect.getX(), rect.getY(), rect.getWidth(), rect.getHeight());
        } catch (e) {
            logError(`error moving window to selected zone`, e);
        }
    }

    _showZoneActor(rect) {
        this._zoneActor.setRectangle(rect);
        this._zoneActor.show();
    }

    _hideZoneActor() {
        this._zoneActor.hide();
    }
}

const ZoneActor = GObject.registerClass(
    class extends St.Bin {
        getRectangle() {
            return new Rectangle(this.x, this.y, this.width, this.height);
        }

        setRectangle(r) {
            this.x = r.getX();
            this.y = r.getY();
            this.width = r.getWidth();
            this.height = r.getHeight();
        }

        constructor() {
            super({
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                styleClass: 'ft-zone-actor',
                visible: false,
            });

            this.set_opacity(FtSettings.getOverlayOpacity() * 255);
            let colArray = FtSettings.getOverlayColor();
            this.set_background_color(
                new Clutter.Color({
                    red: colArray[0] * 255,
                    green: colArray[1] * 255,
                    blue: colArray[2] * 255,
                    alpha: 255,
                })
            );
        }
    }
);

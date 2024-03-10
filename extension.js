/* extension.js
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

import GObject from 'gi://GObject';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { Button as PanelMenuButton } from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { PopupMenuItem } from 'resource:///org/gnome/shell/ui/popupMenu.js';
import FancyTiling from './src/ft.js';
import LayoutEditor from './src/editor/layout-editor.js';

export default class FancyTilingExtension extends Extension {
    _indicator = null;
    _ft = null;

    enable() {
        this._ft = new FancyTiling(this);
        this._indicator = new Indicator(this);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._ft?.destroy();
        this._ft = null;
        this._indicator?.destroy();
        this._indicator = null;
    }
}

const Indicator = GObject.registerClass(
    class extends PanelMenuButton {
        _panelIcon = null;
        _extension = null;

        /*
         * @param {FancyTilingExtension} extension
         */
        constructor(extension) {
            super(0.0, 'FancyTiling');
            this._extension = extension;
        }

        _init() {
            super._init(0.0, 'FancyTiling');

            this._panelIcon = new St.Icon({
                iconSize: 16,
                iconName: 'fancy-tiling-light',
                styleClass: 'system-status-icon',
            });

            this.add_child(this._panelIcon);

            let item = new PopupMenuItem('Preferences');
            item.connect('activate', () => {
                this._extension.openPreferences();
            });

            this.menu.addMenuItem(item);

            let editorItem = new PopupMenuItem('Editor');
            editorItem.connect('activate', () => {
                new LayoutEditor(global.display);
            });

            this.menu.addMenuItem(editorItem);
        }

        destroy() {
            this.destroy_all_children();
            this._panelIcon = null;
            this._extension = null;
        }
    }
);

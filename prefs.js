/* prefs.js
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

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class FtPreferences extends ExtensionPreferences {
    constructor(metadata) {
        super(metadata);
    }

    fillPreferencesWindow(window) {
        this._settings = this.getSettings('org.gnome.shell.extensions.fancy-tiling');

        let g = new GeneralPage(this._settings);
        window.add(g);
        window.set_visible_page(g);

        window.set_size_request(-1, 600);
    }
}

const GeneralPage = GObject.registerClass(
    {
        GTypeName: 'GeneralPage',
        Template: GLib.uri_resolve_relative(import.meta.url, 'resources/ui/prefs-general.ui', GLib.UriFlags.NONE),
        InternalChildren: [
            'btnOverlayColor',
            'opacity',
            'highlightDistance',
            'switchAnimations',
            'dropDownDefaultLayout',
            'layouts',
            'btnOpenEditor',
        ],
    },
    class GeneralPage extends Adw.PreferencesPage {
        constructor(settings) {
            super({});

            this._settings = settings;

            // Zone
            this._settings.bind('animate', this._switchAnimations, 'active', Gio.SettingsBindFlags.DEFAULT);

            // Overlay
            this._settings.bind('zone-snap', this._highlightDistance, 'value', Gio.SettingsBindFlags.DEFAULT);
            this._bindColorWidget('overlay-color', this._btnOverlayColor);
            this._settings.bind('overlay-opacity', this._opacity, 'value', Gio.SettingsBindFlags.DEFAULT);

            // Layout
            this._bindLayoutDropDown();

            this._btnOpenEditor.connect('clicked', (_) => {
                console.log('CLICKED');
                Editor.showEditor();
            });
        }

        _bindLayoutDropDown() {
            let dropDown = this._dropDownDefaultLayout;
            let defaultLayout = this._settings.get_string('default-layout');
            let stringList = this._layouts;
            let json = JSON.parse(this._settings.get_string('layouts'));
            for (let name in json['layouts']) {
                stringList.append(name);
                if (name === defaultLayout) {
                    dropDown.selected = stringList.get_n_items() - 1;
                }
            }

            dropDown.connect('notify::selected', (_) => {
                let item = stringList.get_item(dropDown.selected);
                if (!item) {
                    return;
                }
                this._settings.set_string('default-layout', item.get_string());
            });
        }

        _bindColorWidget(settingsKey, widget) {
            if (!(widget instanceof Gtk.ColorButton)) {
                return;
            }

            widget.connect('color-set', (_) => {
                let val = new GLib.Variant('(ddd)', [widget.rgba.red, widget.rgba.green, widget.rgba.blue]);
                this._settings.set_value(settingsKey, val);
            });

            let rgb = widget.rgba;
            let initColor = this._settings.get_value(settingsKey).deepUnpack();
            rgb.red = initColor[0];
            rgb.green = initColor[1];
            rgb.blue = initColor[2];
            widget.rgba = rgb;
        }
    }
);

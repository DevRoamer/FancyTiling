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
import GObject from 'gi://GObject';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const FancyTilingPreferencesWidget = GObject.registerClass(
  class FancyTilingPreferencesWidget extends Adw.PreferencesGroup {
    constructor() {
      super({
        title: _("Section"),
      });

      this.add(
        new Adw.SwitchRow({
          title: _("Title"),
          subtitle: _("Subtitle"),
          active: true,
        })
      );
    }
  }
);

export default class FancyTilingPreferences extends ExtensionPreferences {
    getPreferencesWidget() {
        return new FancyTilingPreferencesWidget();
    }
}


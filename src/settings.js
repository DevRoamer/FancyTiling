/* src/settings.js
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

export default class FtSettings {
    _gSettings = null;

    static initialize(gSettings) {
        FtSettings._gSettings = gSettings;
    }

    static destroy() {
        FtSettings._gSettings = null;
    }

    static getGSettings() {
        return FtSettings._gSettings;
    }

    static isAnimated() {
        return FtSettings._gSettings.get_boolean(Keys.animate);
    }
    static getDefaultLayout() {
        return FtSettings._gSettings.get_string(Keys.defaultLayout);
    }

    static getOverlayColor() {
        return FtSettings._gSettings.get_value(Keys.overlayColor).deepUnpack();
    }

    static getOverlayOpacity() {
        return FtSettings._gSettings.get_double(Keys.overlayOpacity);
    }

    static getZoneSnap() {
        return FtSettings._gSettings.get_int(Keys.zoneSnap);
    }

    static getLayouts() {
        return FtSettings._gSettings.get_string(Keys.layouts);
    }
}

export const Keys = {
    showIndicator: 'show-indicator',
    overlayColor: 'overlay-color',
    overlayOpacity: 'overlay-opacity',
    animate: 'animate',
    zoneSnap: 'zone-snap',
    defaultLayout: 'default-layout',
    layouts: 'layouts',
};

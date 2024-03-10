import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import FtObject from '../ftobject.js';
import ZoneLayoutManager from '../layout.js';
import { getDisplayClientAreaRect } from '../utils.js';

export default class LayoutEditor extends FtObject {
    constructor(display) {
        super();
        this._display = display;
        this._layoutManager = new ZoneLayoutManager(display);
        this._layoutManager.loadLayouts();
        this._layout = this._layoutManager.getActiveLayout();
        this._bin = new EditorBin(getDisplayClientAreaRect(display));
        this._init();
    }

    _init() {
        this._layout.getZones().forEach((z) => {
            this._bin.addRectangle(z.getName(), z.getRectangle());
        });
    }

    destroy() {
        this._layout = null;
        this._layoutManager?.destroy();
        this._layoutManager = null;
        this._bin?.destroy();
        this._bin = null;
        this._display = null;

        super.destroy();
    }
}

class EditorBin extends FtObject {
    constructor() {
        super();
        this._zoneRectangles = [];
    }

    addRectangle(name, rect) {
        let zoneRect = new EditorRectangle(name, rect);
        this._zoneRectangles.push(zoneRect);
        global.stage.add_child(zoneRect);
    }

    destroy() {
        this._zoneRectangles.forEach((z) => z.destroy());
        this._zoneRectangles = [];
        super.destroy();
    }
}

const EditorRectangle = GObject.registerClass(
    class EditorRectangleClass extends St.Label {
        constructor(name, rectangle) {
            super({
                x: rectangle.getX(),
                y: rectangle.getY(),
                width: rectangle.getWidth(),
                height: rectangle.getHeight(),
                backgroundColor: new Clutter.Color({
                    red: Math.random() * 100,
                    green: Math.random() * 255,
                    blue: Math.random() * 255,
                    alpha: 65,
                }),
                reactive: true,
                canFocus: true,
                trackHover: true,
                styleClass: 'ft-editor-zone',
            });
            this._rectangle = rectangle;
            this.clutter_text.set_text(`<span foreground="white" size="large"><b>${name}</b></span>`);
            this.clutter_text.set_line_alignment(1);
            this.clutter_text.set_use_markup(true);
            this.clutter_text.set_margin_top(8);
        }

        vfunc_style_changed() {
            let col = this.get_background_color();
            col.alpha = this.get_hover() ? 150 : 65;
            this.set_background_color(col);
        }
    }
);

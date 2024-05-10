// Basis for all plugins

export default class Plugin {
    _settings = {}
    _render_el = null;
    _region = null;

    constructor (region, settings) {
        this._settings = settings;
        this._region = region.toUpperCase();

        this._render_el = document.createElement('div');
        this._render_el.classList.add('watch-tile');

        this.render();
    }

    render() {
        // let el = document.createElement('div');
        // el.classList.add('watch-tile');
        
        document.getElementById('watch-tiles').appendChild(this._render_el);
    }

    getSetting(key) {
        return this._settings[key];
    }
}
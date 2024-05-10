import Plugin from './baseplugin.js';
// Simple plugin to show a link to youtube

export default class Empty extends Plugin {
    render() {
        let html = this.getSetting('html');
        this._render_el.innerHTML = html;
        super.render();
    }
}
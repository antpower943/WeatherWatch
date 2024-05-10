import Plugin from './baseplugin.js';
// Simple plugin to show a link to youtube

export default class Embed extends Plugin {
    render() {
        let embed = this.getSetting('code');
        this._render_el.innerHTML = embed;
        super.render();
    }
}
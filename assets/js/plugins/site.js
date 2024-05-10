import Plugin from './baseplugin.js';

export default class Site extends Plugin {
    render() {
        let url = this.getSetting('url');
        this._render_el.innerHTML = '<iframe src="'+url+'" frameborder="0"></iframe>';

        super.render();
    }
}
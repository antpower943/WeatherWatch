import Plugin from './baseplugin.js';

export default class Site extends Plugin {
    render() {
        let zoom = this.getSetting('zoom') || 1;

        let style = `-ms-zoom: `+zoom+`;
        -moz-transform: scale(`+zoom+`);
        -moz-transform-origin: 0 0;
        -o-transform: scale(`+zoom+`);
        -o-transform-origin: 0 0;
        -webkit-transform: scale(`+zoom+`);
        -webkit-transform-origin: 0 0;
        width: `+(100/zoom)+`%;
        height: `+(100/zoom)+`%;
        `;
        let url = this.getSetting('url');
        this._render_el.innerHTML = '<iframe src="'+url+'" frameborder="0" style="'+style+'"></iframe>';

        super.render();
    }
}
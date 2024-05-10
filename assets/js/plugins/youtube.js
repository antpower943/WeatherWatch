import Plugin from './baseplugin.js';

export default class Youtube extends Plugin {
    render() {
        let vid = this.getSetting('id');

        this._render_el.innerHTML = '<iframe src="https://www.youtube.com/embed/'+vid+'?autoplay=1&mute=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';

        super.render();
    }
}
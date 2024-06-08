import Plugin from './baseplugin.js';
// API Docs: https://www.weather.gov/documentation/services-web-api#/default/alerts_active_region
// Icons from: https://boxicons.com/
// Others? https://www.reddit.com/r/webdev/comments/shjcdc/does_anyone_have_any_recommendations_for_font/
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
import * as L from "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet-src.esm.js";


export default class Special_map extends Plugin {
    render() {
        let url = this.getSetting('url');
        this._render_el.innerHTML = `
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
            <style>
            #special-map {
                height: 100%;
                width: 100%;
            }
            </style>

            <div id="special-map"></div>
            `;
        super.render();

        this.init_map();
    }

    init_map() {
        this.map = L.map('special-map', {
            'scrollWheelZoom': 'center',
            dblclickZoom: true
        }).setView([38.479, -98.174], 5);
        this._tilesets = {};
        this._layers = {};

        this._tilesets['Default'] = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(this.map);

        // this._layers = L.layerGroup().addTo(this.map);
        this.us_update();
        setInterval(() => { this.us_update(); }, 1000);
    }

    us_update() {
        // Check for us weather info
        if (window.us_weather_service) {
            if (window.us_weather_service.alerts) {
                let last_update = this.alert_update || 0;
                if (window.us_weather_service.alerts_update !== last_update) {
                    // New info! update time
                    Object.keys(this._layers).forEach(key => {
                        this.map.removeLayer(this._layers[key]);
                    });
                    this._layers = {};

                    window.us_weather_service.alerts.forEach(alert => {
                        let color = 'grey';
                        let fill = '';

                        if (alert.properties.severity == 'Extreme') {
                            if (alert.properties.certainty == 'Observed') { color = 'magenta'; fill = 'magenta'; }
                            else if (alert.properties.certainty == 'Likely') { color = 'red'; fill = 'red'; }
                            else if (alert.properties.certainty == 'Possible') color = 'orange';
                            else if (alert.properties.certainty == 'Unlikely') color = 'yellow';
                        }

                        if (alert.geometry) {
                            if (alert.geometry.type == 'Polygon') {
                                alert.geometry.coordinates.forEach(coordinate => {
                                    let coordinate_out = [];
                                    coordinate.forEach(co => {
                                        coordinate_out.push(co.reverse());
                                    });
                                    let info = `
                                    <h3>`+alert.properties.event+` (`+alert.properties.certainty+`)</h3>
                                    <p>
                                    <b>Started:</b> `+alert.properties.effective+`
                                    <br><b>End:</b> `+alert.properties.ends+`
                                    <br><b>Description</b> `+alert.properties.description.split('\n').join('<br>')+`<script>alert('test');</script>
                                    </p>
                                    `;
                                    const p = L.polygon(coordinate_out, {color: color,weight:2,fill:fill !== '', fillColor:fill}).bindTooltip(info);

                                    this._addToLayer('USWS - '+alert.properties.event,p);
                                })
                            }
                        }
                    });
                    this.alert_update = window.us_weather_service.alerts_update;
                    if (this._layer_control) this.map.removeControl(this._layer_control);

                    L.Control.Layers.include({
                        getActiveOverlays: function () {
                    
                            // Create array for holding active layers
                            var active = [];
                    
                            // Iterate all layers in control
                            this._layers.forEach(function (obj) {
                    
                                // Check if it's an overlay and added to the map
                                if (obj.overlay && this._map.hasLayer(obj.layer)) {
                    
                                    // Push layer to active array
                                    active.push(obj.layer);
                                }
                            });
                    
                            // Return array
                            return active;
                        }
                    });

                    this._layer_control = L.control.layers(this._tilesets, this._layers).addTo(this.map);
                }
            }
        }

        // if (!this._layer_control) this._layer_control = L.control.layers(this._tilesets, this._layers).addTo(this.map);
    }

    _addToLayer(layer, item) {
        if (!this._layers[layer]) this._layers[layer] = L.layerGroup().addTo(this.map);
        this._layers[layer].addLayer(item);
    }
}
import Plugin from './baseplugin.js';
// API Docs: https://www.weather.gov/documentation/services-web-api#/default/alerts_active_region
// Icons from: https://boxicons.com/
// Others? https://www.reddit.com/r/webdev/comments/shjcdc/does_anyone_have_any_recommendations_for_font/

export default class US_Weather_Service extends Plugin {
    _el_alerts = null;
    _cards = [];
    _alerts = [];

    render() {
        // No visual rendering required
        this._render_el.innerHTML = this.getStyle()+`
        <script src="https://unpkg.com/boxicons@2.1.4/dist/boxicons.js"></script>
        <div class="uws-alerts"></div>
        `;
        super.render();

        this._el_alerts = this._render_el.querySelector('.uws-alerts');
        this.fetchAlerts();


    }

    fetchAlerts() {
        let area = '';
        if (!this.getSetting('all')) area = '?area='+this._region;
        fetch('https://api.weather.gov/alerts/active'+area).then(response => {
            return response.json();
        }).then(json => {
            // Building
            json.features.forEach(feature => {
                this.createAlert(feature);
            });
        });
    }

    createAlert(alert) {
        const el = document.createElement('div');
        el.classList.add('uws-alert');

        const area = alert.properties.areaDesc;
        const alert_type = alert.properties.event;
        const alert_severity = alert.properties.severity;
        let alert_icon = '';

        switch (alert_type) {
            case 'Flood Warning':
                alert_icon = 'water';
                break;
        }

        el.innerHTML = `
        <div class="uwsa-icon" style="background:`+this.getAlertColor(alert_severity)+`;"><box-icon name="`+alert_icon+`"></box-icon></div>
        <div class="uwsa-cont">
            <div class="uwsa-title"><b>`+area+`</b></div>
            <div class="uwsa-subtitle">`+alert_type+` // `+alert_severity+`</div>
            <div class="uwsa-info">(i)</div>
        </div>
        `;

        el.querySelector('.uwsa-info').addEventListener('click', function() {
            let output = [];

            function add2output(depth, key, value) {
                let insert_padding = '';
                for (let i = 0; i < depth; i++) insert_padding += '&emsp;'; 
                output.push('<p>'+insert_padding+'<b>'+key+'</b> '+value+'</p>');
            }

            function analyseObject(obj, depth = 0) {
                let keys = [];
                if (typeof obj === 'array')
                    for (let i = 0; i < obj.lenth; i++)
                        keys.push(i);
                else
                    keys = Object.keys(obj);

                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];

                    let value = obj[key];
                    if (value === null) value = 'null';
                    // if (typeof value === 'array') value = value.join(', ');

                    if ((typeof value === 'object') || (typeof value === 'array')) {
                        add2output(depth, key, '');
                        depth++;
                        analyseObject(value, depth);
                        depth--;
                    } else {
                        add2output(depth, key, value);
                    }
                }
            }

            analyseObject(alert);


            
            let el = document.createElement('div');
            el.id = 'uws-info'
            el.innerHTML = '<div id="uwsi-content"><div id="uwsi-obj">'+output.join('')+'</div><button id="uwsi-close">Close</button></div>';
            this.closest('.watch-tile').appendChild(el);
            el.querySelector('#uwsi-close').addEventListener('click', function() {
                this.closest('#uws-info').remove();
            });
        });

        this._render_el.querySelector('.uws-alerts').appendChild(el);
    }

    getAlertColor(severity) {
        return {
            'Extreme': 'rgb(137, 1, 4)',
            'Severe': 'rgb(217, 43, 20)',
            'Moderate': 'rgb(227, 93, 9)',
            'Minor': 'rgb(232, 195, 7)',
            'Unknown': 'rgb(176, 176, 174)'
        }[severity];
    }

    getStyle() {
        return `
        <style>
.uws-alerts {
    width: 100%;
    height: 100%;
    overflow-y: auto;
}

.uws-alert {
    width: 100%;
    height: 80px;
    position: relative;
}

.uws-alert > .uwsa-icon {
    width: 60px;
    height: 60px;
    position: absolute;
    top: 10px;
    left: 10px;
}

.uws-alert > .uwsa-cont {
    position: absolute;
    left: 80px;
    width: calc(100% - 80px);
    top: 0px;
}

.uwsa-title {
    white-space: nowrap;
}

.uwsa-subtitle {
    white-space: nowrap;
}

#uws-info {
    position: absolute;
    top: 0px;
    left: 0px;
    background(111,111,111,0.6);
}

#uwsi-content {
    position: absolute;
    width: calc(100% - 40px);
    height: calc(100% - 40px);
    left: 20px;
    top: 20px;
    background: rgb(11, 11, 11);

}

#uwsi-obj {
    width: calc(100% - 10px);
    height: calc(100% - 40px);
    overflow-y: auto;
    font-size: 10px;
    padding: 5px;
}

#uwsi-obj > p {
    margin: 0px;
    white-space: nowrap;
    padding-left: 5px;
    padding-right: 5px;
}

#uwsi-obj > p > b {
    color: red;
}
        </style>
        `;
    }
}

class Card {
    _settings = null;
    _data = null;

    constructor(settings, data) {
        this._settings = settings;
        this._data = data;

        this.createCard();
    }

    get type() {
        return this._settings['type'];
    }

    createCard() {

    }
}
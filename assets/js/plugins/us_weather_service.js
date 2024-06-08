import Plugin from './baseplugin.js';
// API Docs: https://www.weather.gov/documentation/services-web-api#/default/alerts_active_region
// Icons from: https://boxicons.com/
// Others? https://www.reddit.com/r/webdev/comments/shjcdc/does_anyone_have_any_recommendations_for_font/

export default class US_Weather_Service extends Plugin {
    // _el_alerts = null;
    // _cards = [];
    // _alerts = [];
    // _interval = null;
    // _lastRefresh = null;

    // constructor (region, settings) {
    //     super(region, settings);

    //     // this.render();
    // }

    render() {
        this._el_alerts = null;
        this._cards = [];
        this._alerts = [];
        this._interval = null;
        this._lastRefresh = null;

        this._interval = setInterval(() => {this.fetchAlerts(); }, 60000);

        let cards = this.getSetting('cards');
        if (!Array.isArray(cards)) cards = [];
        if (cards.length == 0) cards.push({"type": "list"});

        cards.forEach(card => {
            if (card.type == 'list')
                this._cards.push(new Card_List(card));
            else
                this._cards.push(new Card_List(card));
        });

        this.fetchAlerts();
    }

    fetchAlerts() {
        let area = '';
        if (!this.getSetting('all')) area = '?area='+this._region;
        fetch('https://api.weather.gov/alerts/active'+area).then(response => {
            return response.json();
        }).then(json => {
            this._lastRefresh = new Date().getTime();

            // Building
            this._alerts = json.features;
            this._cards.forEach(card => { card.updateRender(this._alerts); });

            // Save locally
            if (!window.us_weather_service) window.us_weather_service = {};
            window.us_weather_service.alerts = this._alerts;
            window.us_weather_service.alerts_update = this._lastRefresh;
        });
    }
}

class Card extends Plugin {
    _settings = null;
    _alerts = [];

    constructor(settings) {
        super('', settings);
        this._settings = settings;

        this.createCard();
    }

    get type() {
        return this._settings['type'];
    }

    updateRender(alerts) {
        this._alerts = alerts;

        this.updateCard();
    }

    createCard() {
        // Override to build the HTML
    }

    updateCard() {
        // Override to update the card
    }

}

class Card_List extends Card {

    createCard() {
        this._render_el.innerHTML = this.getStyle()+`
        <script src="https://unpkg.com/boxicons@2.1.4/dist/boxicons.js"></script>
        <div class="uws-alerts"></div>
        `;
        super.render();

        this._el_alerts = this._render_el.querySelector('.uws-alerts');
    }

    updateCard() {
        this._el_alerts.innerHTML = '';
        let groups = [];

        if (this.getSetting('grouped')) {
            // First get the groups
            let gr = {};
            this._alerts.forEach(alert => {
                // if (!(alert.properties.event in groups)) groups.push(alert.properties.event);
                if (!gr[alert.properties.event]) gr[alert.properties.event] = 0;
                gr[alert.properties.event]++;
            });

            // Convert
            groups = [];
            Object.keys(gr).forEach(key=>{
                groups.push({key:key, value:gr[key]});
            });

            // Sort on amount
            groups.sort((a,b)=>{return b.value - a.value});

            console.log(groups);

            // create header for all
            for (let i = 0; i < groups.length; i++) {
                groups[i].el = this.createHeader(groups[i].key + ' ('+groups[i].value+')');
                
            }
        }

        this._alerts.forEach(alert => {
            let el = this.createAlert(alert, this.getSetting('grouped'));

            if (this.getSetting('grouped')) {
                for (let i = 0; i < groups.length; i++) {
                    if (groups[i].key == alert.properties.event) {
                        groups[i].el.querySelector('.uwsh-content').appendChild(el);
                        break;
                    }
                }
            }
        });
    }

    createHeader(name) {
        const el = document.createElement('div');
        el.classList.add('uws-header');
        el.innerHTML = '<div class="uwsh-title"></div><div class="uwsh-content" style="display:none"></div>';
        el.querySelector('.uwsh-title').textContent = name;
        this._render_el.querySelector('.uws-alerts').appendChild(el);
        
        el.addEventListener('click', function() {
            if (this.querySelector('.uwsh-content').style.display == 'none') {
                this.querySelector('.uwsh-content').style.display = 'unset';
            } else {
                this.querySelector('.uwsh-content').style.display = 'none';
            }
        });

        return el;
    }

    createAlert(alert, return_value = false) {
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

        if (return_value) return el;

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

.uwsh-title {
    padding: 2px;
    border-bottom: 1px solid white;
    background: rgb(77,77,77);
    cursor: pointer;
}

.uwsh-title:hover {
    background: rgb(99,99,99);
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
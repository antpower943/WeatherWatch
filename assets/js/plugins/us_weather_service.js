import Plugin from './baseplugin.js';
// API Docs: https://www.weather.gov/documentation/services-web-api#/default/alerts_active_region
// Icons from: https://boxicons.com/
// Others? https://www.reddit.com/r/webdev/comments/shjcdc/does_anyone_have_any_recommendations_for_font/

export default class US_Weather_Service extends Plugin {
    _el_alerts = null;

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
        fetch('https://api.weather.gov/alerts/active?area='+this._region).then(response => {
            return response.json();
        }).then(json => {
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
        </div>
        `;

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
        </style>
        `;
    }
}
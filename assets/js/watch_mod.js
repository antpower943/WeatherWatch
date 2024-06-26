import Plugin_Loader from "./plugin_loader.js";

export default class Watch {
    watch_id='';
    settings = {};
    all_settings = null;
    plugin_loader = null;

    constructor(sett) {
        let id = this.getId() || '';

        this.all_settings = new Settings(sett);
        this.settings = this.all_settings.getSubsettings(id);

        document.getElementById('title').textContent = this.settings.name;
        // Render settings
        this.plugin_loader = new Plugin_Loader(id);
        this.settings.iterateConfigs((configItem) => {
            this.plugin_loader.load(configItem);
        });

        const watches = document.getElementById('watches');
        sett.forEach(setting => {
            let el = document.createElement('option');
            el.textContent = setting.name;
            el.value = setting.short_name;
            watches.appendChild(el);
            if (setting.short_name == id) watches.selectedIndex = watches.children.length-1;
        });

        watches.addEventListener('change', () => {
            location.href = 'watch?id='+watches.children[watches.selectedIndex].value.toLowerCase();
        });
    }

    getId() {
        return this.#getPURLParam('id').toUpperCase();
    }

    #getPURLParam(key) {
        return (new URLSearchParams(window.location.search)).get(key);
    }

    get settings() {
        return this.settings;
    }
}



class Settings {
    settings = [];

    constructor(sett) {
        this.settings = sett;
    }

    getSubsettings(key) {
        return new Subsettings(this.settings, key);
    }
}

class Subsettings {
    subsettings = {};

    constructor(all_settings, id) {
        for (let i = 0; i < all_settings.length; i++) {
            if (all_settings[i].short_name.toUpperCase() == id) {
                this.subsettings = all_settings[i];
                break;
            }
        }
    }

    get id() {
        return this.subsettings.short_name;
    }

    get name() {
        return this.subsettings.name
    }

    iterateConfigs(fn) {
        Object.keys(this.subsettings.config).forEach(key => {
            fn(this.config(key));
        });
    }

    config(key) {
        if (!this.subsettings.config) return null;
        return this.subsettings.config[key];
    }


}

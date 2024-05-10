// Loads plugins

export default class Plugin_Loader {
    plugins = {};
    page_elements = [];
    region = '';

    constructor(region) {
        this.region = region;
    }

    load(config) {
        this.#preLoadCheck(config.type).then(() => {
            this.page_elements.push(new this.plugins[config.type](this.region, config));
        });
    }

    #preLoadCheck(plugin) {
        return new Promise((resolve, reject) => {
            if (!(plugin in this.plugins)) {
                import('./plugins/'+plugin+'.js').then(module => {
                    this.plugins[plugin] = module.default || module;
                    resolve();
                });
            } else resolve();
        });
    }
}
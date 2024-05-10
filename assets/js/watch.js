import Watch from './watch_mod.js'

let _settings = await fetch('settings.json').then((json => { return json.json(); }));
let watch = new Watch(_settings);

console.log(watch.settings.name);
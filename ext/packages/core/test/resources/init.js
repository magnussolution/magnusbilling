addGlobal([
    'spec', '__pageIsReady', '__injectionDone',
    // Seems to be some weird issue with firebug where it will randomly introduce this
    // global, so lets ignore it for now.
    '_xdc_'
]);

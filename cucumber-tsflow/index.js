(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    
    var majorVersion = parseInt(/v(\d*).\d*.\d*/.exec(process.version)[1]);
    
    if (majorVersion >= 4) {
        __export(require("./dist/index"));
    }
    else {
        if (!global._babelPolyfill) {
            require("babel-polyfill");
        }
        
        __export(require("./dist-es5/index"));
    }
});

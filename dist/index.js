"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var generator_1 = require("./lib/generator");
var path_1 = require("path");
var pluginName = "spa-static-pages";
var SpaStaticPagesWebpackPlugin = /** @class */ (function () {
    // Any options should be passed in the constructor of your plugin,
    // (this is a public API of your plugin).
    function SpaStaticPagesWebpackPlugin(options) {
        //TODO Validate options provided
        this.Generator = new generator_1.SpaStaticPages(__assign(__assign({}, SpaStaticPagesWebpackPlugin.defaultOptions()), options));
    }
    SpaStaticPagesWebpackPlugin.defaultOptions = function () {
        return new generator_1.SpaStaticPagesOptions(["/"], path_1.join(__dirname, "../../dist"), [new generator_1.DocumentNode("script", ["src"]), new generator_1.DocumentNode("link", ["href"])], true);
    };
    SpaStaticPagesWebpackPlugin.prototype.apply = function (compiler) {
        var _this = this;
        var plugin = {
            name: pluginName,
        };
        compiler.hooks.emit.tapPromise(plugin, function (compilation) {
            var _a, _b;
            var asset = compilation.getAsset('index.html');
            var content = ((_a = asset === null || asset === void 0 ? void 0 : asset.source) === null || _a === void 0 ? void 0 : _a.buffer()) || ((_b = asset === null || asset === void 0 ? void 0 : asset.source) === null || _b === void 0 ? void 0 : _b.source());
            if (content) {
                console.log('Recieved html content from webpack hook.');
                return _this.Generator.createPagesFor(content);
            }
            else {
                console.error('No index.html found under assets');
            }
            return _this.Generator.createPagesFor();
        });
    };
    return SpaStaticPagesWebpackPlugin;
}());
exports.default = SpaStaticPagesWebpackPlugin;
//# sourceMappingURL=index.js.map
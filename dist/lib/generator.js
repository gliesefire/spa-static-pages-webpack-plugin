"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentNode = exports.SpaStaticPagesOptions = exports.SpaStaticPages = void 0;
var cheerio_1 = require("cheerio");
var path_1 = require("path");
var fs = require("fs");
var html_minifier_1 = require("html-minifier");
var helpers_1 = require("./helpers");
var PageDetail = /** @class */ (function () {
    function PageDetail(route, outputDir, html, outputPath) {
        this.route = route;
        this.outputDir = outputDir;
        this.html = html;
        this.outputPath = outputPath;
    }
    return PageDetail;
}());
var DocumentNode = /** @class */ (function () {
    function DocumentNode(tagName, attributeList) {
        this.tagName = tagName;
        this.attributeList = attributeList;
    }
    return DocumentNode;
}());
exports.DocumentNode = DocumentNode;
var SpaStaticPagesOptions = /** @class */ (function () {
    function SpaStaticPagesOptions(routes, distDir, tagsToTransform, minify) {
        this.routes = routes;
        this.distDir = distDir;
        this.tagsToTransform = tagsToTransform;
        this.minify = minify;
    }
    return SpaStaticPagesOptions;
}());
exports.SpaStaticPagesOptions = SpaStaticPagesOptions;
var SpaStaticPages = /** @class */ (function () {
    function SpaStaticPages(options) {
        this.options = options;
    }
    // Calculate outputPath & create it if it doesn't exist
    SpaStaticPages.prototype.setupDirectory = function () {
        return __awaiter(this, void 0, void 0, function () {
            var i, route, outputDir, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.pageList = new Array();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.options.routes.length)) return [3 /*break*/, 7];
                        route = this.options.routes[i];
                        outputDir = path_1.join(this.options.distDir, route);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, helpers_1.mkdirP(outputDir, {
                                recursive: true,
                            })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        if (typeof err_1 === "string") {
                            throw "Unable to create directory " + outputDir + " for route " + route + ". \n " + err_1;
                        }
                        throw err_1;
                    case 5:
                        this.pageList.push(new PageDetail(route, outputDir, null, path_1.join(outputDir, "index.html")));
                        _a.label = 6;
                    case 6:
                        ++i;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    SpaStaticPages.prototype.modifyHtml = function (data) {
        var _this = this;
        var dataAsString = data.toString();
        var $ = cheerio_1.load(dataAsString);
        this.pageList.forEach(function (page) {
            if (page.route === "/") {
                page.html = dataAsString;
                return;
            }
            _this.options.tagsToTransform.forEach(function (node) {
                $(node.tagName).each(function (_index, element) {
                    node.attributeList.forEach(function (attribute) {
                        var assetLocation = path_1.join(_this.options.distDir, $(element).attr(attribute));
                        var assetFileName = assetLocation
                            .split("\\")
                            .pop()
                            .split("/")
                            .pop();
                        var newAssetLocation = path_1.join(path_1.relative(page.outputDir, _this.options.distDir), assetFileName);
                        if (newAssetLocation != "")
                            $(element).attr(attribute, newAssetLocation);
                    });
                });
            });
            page.html = $.html();
        });
    };
    SpaStaticPages.prototype.copyRouteFileToDestination = function () {
        return __awaiter(this, void 0, void 0, function () {
            var i, result, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 1;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.pageList.length)) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, helpers_1.createFileP(this.pageList[i].outputPath, this.pageList[i].html)];
                    case 3:
                        result = _a.sent();
                        if (result != this.pageList[i].outputPath)
                            throw result;
                        console.log("Route static page " + this.pageList[i].route + " generated successfully to " + this.pageList[i].outputPath);
                        return [3 /*break*/, 5];
                    case 4:
                        err_2 = _a.sent();
                        throw "Unable to write rendered route to file \"" + this.pageList[i].outputPath + "\" \n " + err_2 + ".";
                    case 5:
                        ++i;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SpaStaticPages.prototype.minifyPages = function () {
        if (this.options.minify) {
            //Minify content if specified
            this.pageList.forEach(function (page) {
                page.html = html_minifier_1.minify(page.html);
            });
        }
    };
    SpaStaticPages.prototype.createPagesFor = function (indexFile) {
        if (indexFile === void 0) { indexFile = null; }
        return __awaiter(this, void 0, void 0, function () {
            var indexHtmlPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setupDirectory()];
                    case 1:
                        _a.sent();
                        if (!indexFile) {
                            indexHtmlPath = path_1.join(this.options.distDir, "index.html");
                            if (!helpers_1.isFileExists(indexHtmlPath))
                                throw "'No index.html found at " + this.options.distDir + " directory.";
                            console.log("Picking up index.html from " + this.options.distDir);
                            indexFile = fs.readFileSync(indexHtmlPath);
                        }
                        this.modifyHtml(indexFile);
                        this.minifyPages();
                        return [4 /*yield*/, this.copyRouteFileToDestination()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return SpaStaticPages;
}());
exports.SpaStaticPages = SpaStaticPages;
//# sourceMappingURL=generator.js.map
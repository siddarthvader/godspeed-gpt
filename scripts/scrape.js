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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var cheerio = require("cheerio");
var gpt_3_encoder_1 = require("gpt-3-encoder");
var util_js_1 = require("./util.js");
var fs = require("fs");
var BASE_URL = "https://docs.godspeed.systems/sitemap.xml";
var CHUNK_SIZE = 200;
var getSitemap = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1.default
                    .get(BASE_URL)
                    .then(function (response) {
                    // console.log(response);
                    var sitemapjson = (0, util_js_1.xml2json)(response);
                    return sitemapjson.urlset.url.map(function (url) {
                        return {
                            url: url.loc._text.replace("https://your-docusaurus-test-site.com", "https://docs.godspeed.systems"),
                        };
                    });
                })
                    .catch(function (error) {
                    console.log(error);
                })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var getPage = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var html, $, title, text;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1.default.get(url)];
            case 1:
                html = _a.sent();
                $ = cheerio.load(html.data);
                title = $("title").text();
                $("*").each(function () {
                    if ($(this).is(":not(:empty)")) {
                        $(this).before(" ");
                        $(this).after(" ");
                    }
                });
                text = $("article").text().replace(/\s+/g, " ").trim();
                return [2 /*return*/, {
                        title: title,
                        url: url,
                        date: new Date().toISOString(),
                        content: text,
                        tokens: (0, gpt_3_encoder_1.encode)(text).length,
                        length: text.length,
                        chunks: [],
                    }];
        }
    });
}); };
var chunkEssay = function (doc) { return __awaiter(void 0, void 0, void 0, function () {
    var title, url, date, content, chunklessSection, docTextChunks, split, chunkText, i, sentence, sentenceTokenLength, chunkTextTokenLength, docChunks, i, chunk, prevChunk, chunkedSection;
    var _a;
    return __generator(this, function (_b) {
        title = doc.title, url = doc.url, date = doc.date, content = doc.content, chunklessSection = __rest(doc, ["title", "url", "date", "content"]);
        docTextChunks = [];
        if ((0, gpt_3_encoder_1.encode)(content).length > CHUNK_SIZE) {
            split = content.split(". ");
            chunkText = "";
            for (i = 0; i < split.length; i++) {
                sentence = split[i];
                sentenceTokenLength = (0, gpt_3_encoder_1.encode)(sentence);
                chunkTextTokenLength = (0, gpt_3_encoder_1.encode)(chunkText).length;
                if (chunkTextTokenLength + sentenceTokenLength.length > CHUNK_SIZE) {
                    docTextChunks.push(chunkText);
                    chunkText = "";
                }
                if ((_a = sentence[sentence.length - 1]) === null || _a === void 0 ? void 0 : _a.match(/[a-z0-9]/i)) {
                    chunkText += sentence + ". ";
                }
                else {
                    chunkText += sentence + " ";
                }
            }
            docTextChunks.push(chunkText.trim());
        }
        else {
            docTextChunks.push(content.trim());
        }
        docChunks = docTextChunks.map(function (text) {
            var trimmedText = text.trim();
            var chunk = {
                doc_title: title,
                doc_url: url,
                doc_date: date,
                content: trimmedText,
                content_length: trimmedText.length,
                content_tokens: (0, gpt_3_encoder_1.encode)(trimmedText).length,
                embedding: [],
            };
            return chunk;
        });
        if (docChunks.length > 1) {
            for (i = 0; i < docChunks.length; i++) {
                chunk = docChunks[i];
                prevChunk = docChunks[i - 1];
                if (chunk.content_tokens < 100 && prevChunk) {
                    prevChunk.content += " " + chunk.content;
                    prevChunk.content_length += chunk.content_length;
                    prevChunk.content_tokens += chunk.content_tokens;
                    docChunks.splice(i, 1);
                    i--;
                }
            }
        }
        chunkedSection = __assign(__assign({}, doc), { chunks: docChunks });
        return [2 /*return*/, chunkedSection];
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var sitemap, docs, i, doc, chunkedDoc, json;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getSitemap()];
            case 1:
                sitemap = _a.sent();
                console.log("sitemap", sitemap);
                docs = [];
                i = 0;
                _a.label = 2;
            case 2:
                if (!(i < sitemap.length)) return [3 /*break*/, 6];
                return [4 /*yield*/, getPage(sitemap[i].url)];
            case 3:
                doc = _a.sent();
                return [4 /*yield*/, chunkEssay(doc)];
            case 4:
                chunkedDoc = _a.sent();
                docs.push(chunkedDoc);
                _a.label = 5;
            case 5:
                i++;
                return [3 /*break*/, 2];
            case 6:
                json = {
                    current_date: new Date().toISOString(),
                    author: "sid",
                    url: "https://docs.godspeed.systems/sitemap.xml",
                    tokens: docs.reduce(function (acc, doc) { return acc + doc.tokens; }, 0),
                    length: docs.reduce(function (acc, doc) { return acc + doc.length; }, 0),
                    docs: docs,
                };
                fs.writeFileSync("scripts/gs.json", JSON.stringify(json));
                return [2 /*return*/];
        }
    });
}); })();

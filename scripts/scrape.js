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
Object.defineProperty(exports, "__esModule", { value: true });
var text_splitter_1 = require("langchain/text_splitter");
var env_1 = require("@next/env");
var fs = require("fs");
var sidebars = require("./gs_doc-main/sidebars.js");
var OpenAIEmbeddings = require("langchain/embeddings").OpenAIEmbeddings;
var SupabaseVectorStore = require("langchain/vectorstores/supabase").SupabaseVectorStore;
(0, env_1.loadEnvConfig)("");
var privateKey = process.env.SUPABASE_PRIVATE_KEY;
if (!privateKey)
    throw new Error("Expected env var SUPABASE_PRIVATE_KEY");
var url = process.env.SUPABASE_URL;
if (!url)
    throw new Error("Expected env var SUPABASE_URL");
var CHUNK_SIZE = 1500;
var CHUNK_OVERLAP = 500;
var BASE_URL = "scripts/gs_doc-main/docs/";
var POSTFIX = ".md";
var DOC_URL = "https://docs.godspeed.systems/docs/";
var getPage = function (base_url, url, postfix, doc_url) { return __awaiter(void 0, void 0, void 0, function () {
    var html, splitter, output;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                html = fs.readFileSync(base_url + url + postfix, "utf8");
                console.log(html);
                splitter = new text_splitter_1.MarkdownTextSplitter({
                    chunkSize: CHUNK_SIZE,
                    chunkOverlap: CHUNK_OVERLAP,
                });
                return [4 /*yield*/, splitter.createDocuments([html], [
                        {
                            source: doc_url + url,
                        },
                    ])];
            case 1:
                output = _a.sent();
                // console.log(output);
                return [2 /*return*/, output];
        }
    });
}); };
var getSitemap = function (list) {
    // console.log(list);
    return list.reduce(function (sitemap, item, index) {
        var _a, _b;
        if (!((_a = item === null || item === void 0 ? void 0 : item.items) === null || _a === void 0 ? void 0 : _a.length)) {
            sitemap.push((_b = item.id) !== null && _b !== void 0 ? _b : item);
        }
        else {
            sitemap.push(getSitemap(item.items));
        }
        return sitemap;
    }, []);
};
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var sitemap, docs, i, doc;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                sitemap = getSitemap(sidebars.tutorialSidebar).flat().flat();
                docs = [];
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < sitemap.length)) return [3 /*break*/, 4];
                return [4 /*yield*/, getPage(BASE_URL, sitemap[i], POSTFIX, DOC_URL)];
            case 2:
                doc = _a.sent();
                // console.log(doc.metadata);
                docs.push(doc);
                _a.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4:
                console.log(docs.flat());
                return [2 /*return*/];
        }
    });
}); })();

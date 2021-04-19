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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.todaysMagazines = void 0;
var time_1 = require("./scraper-utils/time");
/*
楽天マガジン要チェック雑誌
 芸能系
頻度多
・週刊プレイボーイ 月
・月刊エンタメ 毎月30日
・EX大衆 毎月15日
・Platinum FLASH 不定期
*/
var magazines1 = function (date) {
    var magazines = [];
    if (date.getDay() == 1) {
        magazines.push(['週刊プレイボーイ']);
    }
    if (date.getDate() == 30) {
        magazines.push(['月刊エンタメ']);
    }
    if (date.getDate() === 15) {
        magazines.push(['EX大衆']);
    }
    return magazines;
};
/*
頻度中（時々グラビア掲載）
・FRIDAY 金
・サイゾー 毎月１８日
・ FLASH 火
・日経エンタメ 毎月４日
*/
var magazines2 = function (date) {
    var magazines = [];
    if (date.getDay() === 5) {
        magazines.push(['FRIDAY']);
    }
    if (date.getDate() === 18) {
        magazines.push(['サイゾー']);
    }
    if (date.getDay() === 2) {
        magazines.push(['FLASH']);
    }
    if (date.getDate() === 4) {
        magazines.push(['日経エンタメ']);
    }
    return magazines;
};
/*
頻度小（スキャンダルで掲載）
・SPA！ 火
・週刊大衆 月
・女性自身 火
・週刊文春 木
・週刊新潮 木
・女性セブン 紙版は木、電子版は金
・週刊ポスト 紙版は月、電子版は火
*/
var magazines3 = function (date) {
    var magazines = [];
    switch (date.getDay()) {
        case 1:
            magazines.push(['週刊大衆']);
            break;
        case 2:
            magazines.push(['SPA！'], ['女性自身'], ['週刊ポスト']);
            break;
        case 4:
            magazines.push(['週刊文春'], ['週刊新潮']);
            break;
        case 5:
            magazines.push(['女性セブン']);
            break;
        default:
            break;
    }
    return magazines;
};
/*
 女性ファッション
・ar 毎月１２
・LARME 3,6,9,12月の17日
・non-no 毎月２０日
・ViVi 毎月２３日
・Ray 毎月23日
・CamCam 毎月23日
・Seventeen 毎月1日
・bis 偶数月1日
*/
var magazines4 = function (date) {
    var magazines = [];
    switch (date.getDate()) {
        case 1:
            magazines.push(['Seventeen']);
            if ((date.getMonth() + 1) % 2 === 0) {
                magazines.push(['bis']);
            }
            break;
        case 12:
            magazines.push(['ar']);
            break;
        case 17:
            if ((date.getMonth() + 1) % 3 === 0) {
                magazines.push(['LARME']);
            }
            break;
        case 20:
            magazines.push(['non-no']);
            break;
        case 23:
            magazines.push(['Ray'], ['CamCam']);
            break;
        default:
            break;
    }
    return magazines;
};
var todaysMagazines = function () { return __awaiter(void 0, void 0, void 0, function () {
    var dates;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, time_1.publishDates()];
            case 1:
                dates = _a.sent();
                return [2 /*return*/, dates
                        .map(function (date) {
                        return __spreadArray(__spreadArray(__spreadArray(__spreadArray([], magazines1(date)), magazines2(date)), magazines3(date)), magazines4(date)).map(function (m) {
                            return { title: m[0] };
                        });
                    })
                        .reduce(function (acc, curr) {
                        acc.push.apply(acc, curr);
                        return acc;
                    }, [])];
        }
    });
}); };
exports.todaysMagazines = todaysMagazines;
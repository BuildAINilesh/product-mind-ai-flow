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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
// This file is intended to be run with ts-node in a CommonJS environment
var express_1 = require("express");
var cors_1 = require("cors");
var axios_1 = require("axios");
var app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post('/api/jira', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, jiraUrl, username, apiToken, projectKey, stories, auth, allSuccess, errorMsg, _i, stories_1, story, err_1;
    var _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = req.body, jiraUrl = _a.jiraUrl, username = _a.username, apiToken = _a.apiToken, projectKey = _a.projectKey, stories = _a.stories;
                if (!jiraUrl || !username || !apiToken || !projectKey || !stories) {
                    return [2 /*return*/, res.status(400).json({ error: 'Missing fields' })];
                }
                auth = Buffer.from("".concat(username, ":").concat(apiToken)).toString('base64');
                allSuccess = true;
                errorMsg = '';
                _i = 0, stories_1 = stories;
                _e.label = 1;
            case 1:
                if (!(_i < stories_1.length)) return [3 /*break*/, 6];
                story = stories_1[_i];
                _e.label = 2;
            case 2:
                _e.trys.push([2, 4, , 5]);
                return [4 /*yield*/, axios_1.default.post("".concat(jiraUrl, "/rest/api/3/issue"), {
                        fields: {
                            project: { key: projectKey },
                            summary: story.content || 'User Story',
                            description: story.actor ? "As ".concat(story.actor, ", ").concat(story.content) : story.content,
                            issuetype: { name: 'Story' },
                        },
                    }, {
                        headers: {
                            Authorization: "Basic ".concat(auth),
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                    })];
            case 3:
                _e.sent();
                return [3 /*break*/, 5];
            case 4:
                err_1 = _e.sent();
                allSuccess = false;
                errorMsg = ((_d = (_c = (_b = err_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.errorMessages) === null || _d === void 0 ? void 0 : _d.join(', ')) || err_1.message;
                return [3 /*break*/, 6];
            case 5:
                _i++;
                return [3 /*break*/, 1];
            case 6:
                if (allSuccess) {
                    res.json({ success: true });
                }
                else {
                    res.status(400).json({ error: errorMsg });
                }
                return [2 /*return*/];
        }
    });
}); });
var PORT = 4000;
app.listen(PORT, function () { return console.log("Jira proxy running on port ".concat(PORT)); });

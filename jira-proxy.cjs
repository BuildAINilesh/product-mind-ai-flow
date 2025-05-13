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
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
app.use(express.json());
app.use(cors());
app.post('/api/jira', async (req, res) => {
    const { jiraUrl, username, apiToken, projectKey, stories, sprintId } = req.body;
    if (!jiraUrl || !username || !apiToken || !projectKey || !stories) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    const auth = Buffer.from(`${username}:${apiToken}`).toString('base64');
    let allSuccess = true;
    let errorMsg = '';
    for (const story of stories) {
        const payload = {
            fields: {
                project: { key: projectKey },
                summary: story.content || 'User Story',
                description: story.actor ? `As ${story.actor}, ${story.content}` : story.content,
                issuetype: { name: 'Story' },
            },
        };
        const headers = {
            Authorization: `Basic ${auth}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
        // Log the request details
        console.log('--- Jira API Request ---');
        console.log('POST', `${jiraUrl}/rest/api/3/issue`);
        console.log('Headers:', headers);
        console.log('Payload:', JSON.stringify(payload, null, 2));
        try {
            const createRes = await axios.post(
                `${jiraUrl}/rest/api/3/issue`,
                payload,
                { headers }
            );
            // Log the response
            console.log('--- Jira API Response ---');
            console.log('Status:', createRes.status);
            console.log('Data:', JSON.stringify(createRes.data, null, 2));
            // Sprint logic (if needed)
            if (sprintId && createRes.data && createRes.data.id) {
                const issueId = createRes.data.id;
                const sprintRes = await axios.post(
                    `${jiraUrl}/rest/agile/1.0/sprint/${sprintId}/issue`,
                    { issues: [issueId] },
                    { headers }
                );
                console.log('--- Jira Sprint Assignment Response ---');
                console.log('Status:', sprintRes.status);
                console.log('Data:', JSON.stringify(sprintRes.data, null, 2));
            }
        } catch (err) {
            allSuccess = false;
            errorMsg = err.response?.data?.errorMessages?.join(', ') || err.message;
            // Log the error response
            if (err.response) {
                console.log('--- Jira API Error Response ---');
                console.log('Status:', err.response.status);
                console.log('Data:', JSON.stringify(err.response.data, null, 2));
            } else {
                console.log('--- Jira API Error ---');
                console.log(err.message);
            }
            break;
        }
    }
    if (allSuccess) {
        res.json({ success: true });
    } else {
        res.status(400).json({ error: errorMsg });
    }
});
const PORT = 4000;
app.listen(PORT, () => console.log(`Jira proxy running on port ${PORT}`));

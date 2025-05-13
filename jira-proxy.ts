// This file is intended to be run with ts-node in a CommonJS environment
const express = require('express');
const cors = require('cors');
import type { Request, Response } from 'express';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

interface JiraStory {
  content: string;
  status: string;
  actor?: string;
}

app.post('/api/jira', async (req: Request, res: Response) => {
  const { jiraUrl, username, apiToken, projectKey, stories, sprintId } = req.body;
  console.log('--- Incoming /api/jira request ---');
  console.log('Project Key:', projectKey);
  if (stories && stories.length > 0) {
    console.log('First item:', JSON.stringify(stories[0], null, 2));
    console.log('Total items:', stories.length);
  } else {
    console.log('No stories/items received.');
  }
  if (!jiraUrl || !username || !apiToken || !projectKey || !stories) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const auth = Buffer.from(`${username}:${apiToken}`).toString('base64');
  let allSuccess = true;
  let errorMsg = '';
  for (const story of stories) {
    console.log('Processing item:', JSON.stringify(story, null, 2));
    // Always use a non-empty string for text
    const text = (story.actor ? `As ${story.actor}, ${story.content}` : story.content) || 'User Story';
    const summary = (story.content || 'User Story').slice(0, 250);
    const payload = {
      fields: {
        project: { key: projectKey },
        summary,
        issuetype: { name: 'Story' },
      },
    };
    const headers = {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    try {
      const createRes = await axios.post(
        `${jiraUrl}/rest/api/3/issue`,
        payload,
        { headers }
      );
      // Sprint logic (if needed)
      if (sprintId && createRes.data && createRes.data.id) {
        const issueId = createRes.data.id;
        await axios.post(
          `${jiraUrl}/rest/agile/1.0/sprint/${sprintId}/issue`,
          { issues: [issueId] },
          { headers }
        );
      }
    } catch (err: unknown) {
      allSuccess = false;
      if (typeof err === "object" && err !== null) {
        const anyErr = err as any;
        errorMsg =
          anyErr.response?.data?.errors?.description ||
          anyErr.response?.data?.errorMessages?.join(', ') ||
          anyErr.message ||
          "Unknown error";
      } else {
        errorMsg = String(err);
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
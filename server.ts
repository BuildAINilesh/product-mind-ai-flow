import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

interface JiraSettings {
  jiraUrl: string;
  email: string;
  apiToken: string;
}

const SETTINGS_PATH = path.join(__dirname, 'jira-settings.json');

app.post('/api/save-jira-settings', async (req: Request, res: Response) => {
  const { jiraUrl, email, apiToken } = req.body as JiraSettings;
  if (!jiraUrl || !email || !apiToken) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }

  // Save settings to a local JSON file
  try {
    fs.writeFileSync(
      SETTINGS_PATH,
      JSON.stringify({ jiraUrl, email, apiToken }, null, 2),
      'utf-8'
    );
    res.json({ success: true, message: 'Jira settings saved locally.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Jira backend listening on port ${PORT}`);
}); 
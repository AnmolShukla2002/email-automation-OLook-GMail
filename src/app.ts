import express from 'express';
import { getGmailAuthUrl, getGmailTokens } from './config/gmail';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.get('/auth/gmail', (req, res) => {
  console.log('Redirecting to Gmail auth URL');
  console.debug('Gmail auth URL:', getGmailAuthUrl());
  res.redirect(getGmailAuthUrl());
});

app.get('/oauth2callback', async (req, res) => {
  console.log('Received OAuth2 callback');
  const code = req.query.code as string;
  console.log('Auth code:', code);

  try {
    const tokens = await getGmailTokens(code);
    console.log('Gmail tokens obtained successfully');
    console.log('Tokens:', tokens);
    res.send(`Gmail Auth Success! Tokens: ${JSON.stringify(tokens)}`);
  } catch (error) {
    console.error('Error obtaining Gmail tokens:', error);
    res.status(500).send('Error obtaining Gmail tokens');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
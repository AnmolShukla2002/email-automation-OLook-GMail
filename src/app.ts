import express from 'express';
import { getGmailAuthUrl, getGmailTokens, fetchEmails, sendEmail } from './config/gmail';
import { categorizeEmail } from './openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/auth/gmail', (req, res) => {
  const url = getGmailAuthUrl();
  res.redirect(url);
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code as string;
  try {
    const tokens = await getGmailTokens(code);
    res.send('Gmail Auth Success!');
  } catch (error) {
    res.status(500).send('Error obtaining Gmail tokens');
  }
});

app.get('/fetch-emails', async (req, res) => {
  try {
    const emails = await fetchEmails();
    res.json(emails);
  } catch (error) {
    res.status(500).send('Error fetching emails');
  }
});

app.get('/process-emails', async (req, res) => {
  try {
    const emails = await fetchEmails();
    for (const email of emails) {
      const emailBody = email.snippet || '';
      const category = await categorizeEmail(emailBody);

      console.log(`Email categorized as: ${category}`);

      let reply = '';
      if (category === 'Interested') {
        reply = 'Thank you for your interest. We will get back to you soon.';
      } else if (category === 'Not Interested') {
        reply = 'Thank you for your time. We hope to hear from you in the future.';
      } else if (category === 'More Information Needed') {
        reply = 'Could you please provide more details so we can assist you further?';
      }

      if (email.payload?.headers) {
        const toHeader = email.payload.headers.find(header => header.name === 'From');
        if (toHeader) {
          await sendEmail(toHeader.value, 'Re: Your Email', reply);
          console.log(`Reply sent to: ${toHeader.value}`);
        }
      }
    }
    res.send('Emails processed and replies sent');
  } catch (error) {
    console.error('Error processing emails:', error);
    res.status(500).send('Error processing emails');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

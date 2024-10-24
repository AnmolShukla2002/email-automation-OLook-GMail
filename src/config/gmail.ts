import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI } = process.env;

if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REDIRECT_URI) {
  throw new Error("Missing required environment variables. Please check your .env file.");
}

const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
);

export const getGmailAuthUrl = () => {
  console.debug('Generating Gmail auth URL');
  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    redirect_uri: GMAIL_REDIRECT_URI
  });
  return url;
};

export const getGmailTokens = async (code: string) => {
  console.log('Obtaining Gmail tokens');
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Tokens obtained:', tokens);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error('Error obtaining Gmail tokens:', error);
    throw error;
  }
};

export const gmailClient = oauth2Client;

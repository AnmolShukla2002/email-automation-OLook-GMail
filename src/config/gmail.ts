import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

if (
  !process.env.GMAIL_CLIENT_ID ||
  !process.env.GMAIL_CLIENT_SECRET ||
  !process.env.GMAIL_REDIRECT_URI
) {
  throw new Error(
    "GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REDIRECT_URI must be set in .env file"
  );
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

/**
 * Generate Gmail authentication URL.
 *
 * @returns {string} Authentication URL
 */
export const getGmailAuthUrl = () => {
  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
  ];
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes.join(" "), 
  });
};

/**
 * Get Gmail tokens.
 *
 * @param {string} code Authorization code
 * @returns {Promise<object>} Tokens
 */
export const getGmailTokens = async (code: string) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error("Error getting Gmail tokens:", error);
    throw error;
  }
};

/**
 * Fetch emails.
 *
 * @returns {Promise<Array<object>>} Emails
 */
export const fetchEmails = async () => {
  try {
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const response = await gmail.users.messages.list({ userId: "me", maxResults: 10 });

    if (!response.data || !response.data.messages || response.data.messages.length === 0) {
      console.log("No new emails found");
      return [];
    }

    const emails = await Promise.all(
      response.data.messages.map(async (msg) => {
        const emailResponse = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
        });
        return emailResponse.data;
      })
    );

    return emails;
  } catch (error) {
    console.error("Error fetching emails:", error);
    throw error;
  }
};

/**
 * Send email.
 *
 * @param {string} to Recipient's email
 * @param {string} subject Email subject
 * @param {string} message Email body
 * @returns {Promise<void>}
 */
export const sendEmail = async (
  to: string,
  subject: string,
  message: string
) => {
  try {
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const raw = Buffer.from(
      `To: ${to}\r\nSubject: ${subject}\r\n\r\n${message}`,
      "utf8"
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

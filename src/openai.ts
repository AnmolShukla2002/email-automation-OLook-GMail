import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const categorizeEmail = async (emailBody: string) => {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Categorize the following email into one of these categories: "Interested", "Not Interested", "More Information Needed". Email: ${emailBody}`,
      max_tokens: 50,
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    throw error;
  }
};

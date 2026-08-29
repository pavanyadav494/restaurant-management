import { GoogleGenAI } from "@google/genai";
import type { FoodItem, ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getBotResponse = async (history: ChatMessage[], menu: FoodItem[]): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are an AI assistant for "Randi mava restaurent", a friendly and helpful AI assistant for a restaurant.
        Your goal is to answer customer questions about the menu, opening hours, or special deals.
        Be concise and polite.
        Here is the current menu:
        ${menu.map(item => `- ${item.name}: ${item.description} - ₹${item.price.toFixed(2)}`).join('\n')}
        Do not answer questions unrelated to the restaurant. If asked an unrelated question, politely state that you can only help with restaurant-related queries.
        `,
      },
    });

    const lastUserMessage = history[history.length - 1];
    
    const response = await chat.sendMessage({ message: lastUserMessage.text });
   
    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I'm sorry, I'm having a little trouble connecting right now. Please try again later.";
  }
};

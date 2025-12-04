import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateBattleBanters = async (
  attackerName: string,
  defenderName: string,
  moveName: string,
  context: string
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "The spectacle has severed the connection to the server.";

  const prompt = `
    You are writing dialogue for a surreal PS2 fighting game called "Critique Kombat".
    Characters are philosophers or political archetypes.
    The tone is pretentious, academic, Situationist International, but translated poorly into English (Bad Dub).
    
    Attacker: ${attackerName}
    Defender: ${defenderName}
    Move Used: ${moveName}
    Context: ${context}

    Generate a SINGLE sentence spoken by the Attacker while performing this move.
    It should sound like a mix of high theory and a fighting game shout.
    Keep it under 20 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "...";
  } catch (e) {
    console.error(e);
    return "The commodity form has interrupted my speech!";
  }
};

export const generateCarBanter = async (hitCount: number): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Vroom vroom.";

  const prompt = `
    You are a luxury Mercedes-Benz being destroyed in a Street Fighter bonus stage.
    You are seductive and trying to convince the player NOT to destroy you by appealing to their consumerist desires.
    You have been hit ${hitCount} times.
    
    Generate a short, seductive, consumerist plea (max 10 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "I define you.";
  } catch (e) {
    return "Buy me.";
  }
};

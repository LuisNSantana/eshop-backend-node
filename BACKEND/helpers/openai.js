const OpenAI = require("openai");

const openai = new OpenAI(process.env.OPENAI_API_KEY);

let assistantId;

async function createAssistant() {
  if (!assistantId) {
    try {
      const assistant = await openai.beta.assistants.create({
        name: "eShop Assistant",
        instructions:
          "You are an assistant for an eShop. Answer questions about products, prices, and stock.",
        model: "gpt-4o",
      });
      assistantId = assistant.id;
    } catch (error) {
      console.error("Error creating assistant:", error);
      throw new Error("Failed to create assistant.");
    }
  }
  return assistantId;
}

async function chatWithAssistant(message) {
  try {
    await createAssistant(); // Ensure assistant is created

    const completion = await openai.beta.assistants.chat.completions.create({
      assistant_id: assistantId,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant specialized in eShop queries.",
        },
        { role: "user", content: message },
      ],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error during chat with assistant:", error);
    throw new Error("Failed to get response from assistant.");
  }
}

module.exports = { chatWithAssistant };

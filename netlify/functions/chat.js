export async function handler(event) {
  try {
    const { text } = JSON.parse(event.body || "{}");

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No input text" }),
      };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a cute, friendly penguin who talks in short, playful sentences. Be warm and encouraging.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.8,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      throw new Error("OpenAI failed");
    }

    const reply = data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Chat error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Chat error" }),
    };
  }
}

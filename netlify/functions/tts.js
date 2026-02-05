
  export async function handler(event) {
    try {
      const { text } = JSON.parse(event.body || "{}");
  
      if (!text) {
        return {
          statusCode: 400,
          body: "No text provided",
        };
      }
  
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/MG01mrdd2JtrEG1RhHk5`,
        {
          method: "POST",
          headers: {
            "xi-api-key": process.env.ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.4,
              similarity_boost: 0.75,
            },
          }),
        }
      );
  
      if (!response.ok) {
        const errText = await response.text();
        console.error("ElevenLabs error:", errText);
        throw new Error("TTS failed");
      }
  
      const audioBuffer = await response.arrayBuffer();
  
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "audio/mpeg",
        },
        body: Buffer.from(audioBuffer).toString("base64"),
        isBase64Encoded: true,
      };
    } catch (err) {
      console.error("TTS error:", err);
      return {
        statusCode: 500,
        body: "TTS error",
      };
    }
  }
  

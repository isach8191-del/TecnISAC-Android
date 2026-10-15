
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Utilize o método POST para enviar perguntas."
    });
  }

  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Escreva uma pergunta."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "A chave do Gemini não está configurada no servidor."
      });
    }

    const contents = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-10)) {
        if (
          item &&
          typeof item.content === "string" &&
          ["user", "model"].includes(item.role)
        ) {
          contents.push({
            role: item.role,
            parts: [{ text: item.content }]
          });
        }
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "És o TecnISAC, um assistente de inteligência artificial especializado em tecnologia, eletrónica e reparação de dispositivos Android. Compreende a pergunta, analisa as causas possíveis e responde em português claro, com explicações, esquemas e passos numerados quando forem úteis. Se não souberes algo, sê honesto."
            }]
          },
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Gemini:", data);
      return res.status(502).json({
        error: "Não foi possível obter resposta do Gemini.",
        details: data.error?.message || "Erro no serviço de IA."
      });
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

    if (!answer) {
      return res.status(502).json({
        error: "O Gemini não devolveu uma resposta."
      });
    }

    return res.status(200).json({
      answer,
      text: answer,
      status: "success"
    });
  } catch (error) {
    console.error("Erro no chat:", error);
    return res.status(500).json({
      error: "Erro interno ao processar a pergunta."
    });
  }
}

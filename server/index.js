
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/", (req, res) => {
  res.json({
    status: "online",
    app: "TecnISAC",
    message: "Servidor de IA disponível"
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: "O servidor ainda não está configurado com a chave da IA."
      });
    }

    const messages = req.body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Envie uma lista de mensagens."
      });
    }

    const history = messages
      .filter(
        (m) =>
          ["user", "assistant"].includes(m.role) &&
          typeof m.content === "string"
      )
      .slice(-12)
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 12000)
      }));

    if (history.length === 0) {
      return res.status(400).json({
        error: "Não foi encontrada uma pergunta válida."
      });
    }

    const openai = new OpenAI({ apiKey });

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions:
        "És o TecnISAC, um assistente de inteligência artificial especializado em tecnologia, informática, eletrónica e resolução de problemas. Compreende primeiro a intenção do utilizador. Analisa o problema por etapas, explica as causas prováveis, apresenta soluções práticas e seguras, organiza respostas com títulos e listas quando útil e responde em português claro. Se faltarem dados importantes, faz perguntas objetivas. Não inventes factos, testes realizados ou fontes. Distingue factos de hipóteses.",
      input: history
    });

    res.json({
      reply: response.output_text || "Não foi possível gerar uma resposta."
    });
  } catch (error) {
    console.error("Erro na IA:", error.message);

    res.status(500).json({
      error: "Não foi possível obter uma resposta da IA. Tenta novamente."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor TecnISAC iniciado na porta ${PORT}`);
});

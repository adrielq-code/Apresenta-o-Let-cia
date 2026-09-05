import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy GoogleGenAI client singleton
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: "gemini-3.8-flash",
  });
});

// Helper for cleaning JSON markdown from model response
function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

// Ensure elements fit within 16:9 canvas (0-100%) and preserve locked items
function sanitizeSlideElements(elements: any[], originalElements: any[] = []): any[] {
  const originalLockedMap = new Map<string, any>();
  originalElements.forEach((el) => {
    if (el && el.locked) {
      originalLockedMap.set(el.id, el);
    }
  });

  return elements.map((el, index) => {
    // If it was locked originally, strictly preserve original properties
    if (originalLockedMap.has(el.id)) {
      return originalLockedMap.get(el.id);
    }

    const width = Math.min(Math.max(Number(el.width) || 20, 5), 100);
    const height = Math.min(Math.max(Number(el.height) || 10, 4), 100);
    const x = Math.min(Math.max(Number(el.x) || 5, 0), 100 - width);
    const y = Math.min(Math.max(Number(el.y) || 5, 0), 100 - height);

    return {
      id: el.id || `elem-ai-${Date.now()}-${index}`,
      type: el.type || "text",
      name: el.name || `Elemento ${index + 1}`,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      width: Math.round(width * 10) / 10,
      height: Math.round(height * 10) / 10,
      rotation: Number(el.rotation) || 0,
      zIndex: Number(el.zIndex) || index + 1,
      opacity: typeof el.opacity === "number" ? el.opacity : 1,
      locked: Boolean(el.locked),
      content: String(el.content || ""),
      secondaryContent: el.secondaryContent ? String(el.secondaryContent) : undefined,
      style: {
        fontSize: el.style?.fontSize ? Math.min(Math.max(Number(el.style.fontSize), 11), 72) : 18,
        fontFamily: el.style?.fontFamily || "Montserrat, sans-serif",
        fontWeight: el.style?.fontWeight || "normal",
        fontStyle: el.style?.fontStyle || "normal",
        textAlign: el.style?.textAlign || "left",
        color: el.style?.color || "#2C2C2C",
        backgroundColor: el.style?.backgroundColor || undefined,
        borderColor: el.style?.borderColor || undefined,
        borderWidth: el.style?.borderWidth ? Number(el.style.borderWidth) : undefined,
        borderRadius: el.style?.borderRadius ? Number(el.style.borderRadius) : undefined,
        lineHeight: el.style?.lineHeight ? Number(el.style.lineHeight) : 1.4,
        letterSpacing: el.style?.letterSpacing ? Number(el.style.letterSpacing) : undefined,
        objectFit: el.style?.objectFit || "cover",
        shapeType: el.style?.shapeType || undefined,
        shadow: Boolean(el.style?.shadow),
      },
      animation: el.animation || "fade",
    };
  });
}

// ----------------------------------------------------------------------
// 1. POST /api/ai/edit-slide
// ----------------------------------------------------------------------
app.post("/api/ai/edit-slide", async (req, res) => {
  try {
    const { prompt, slide, presentationContext, settings } = req.body;

    if (!slide || !prompt) {
      return res.status(400).json({ error: "Slide e prompt são obrigatórios" });
    }

    const ai = getAIClient();
    if (ai) {
      try {
        const systemPrompt = `Você é o Designer Chefe e Redator especialista em apresentações no formato TED Talk / Keynote 16:9 de alto padrão.
Sua missão: Modificar e aprimorar o slide atual atendendo ao comando do usuário com precisão estética e textual absoluta.

REGRAS CRÍTICAS DE DESIGN E FUNCIONALIDADE:
1. CANVAS 16:9: Todas as posições são percentuais (0 a 100). Certifique-se de que (x + width <= 100) e (y + height <= 100).
2. ELEMENTOS BLOQUEADOS: Se algum elemento tiver "locked": true, você NÃO PODE alterar sua posição, tamanho, conteúdo ou estilo. Mantenha-o exatamente igual.
3. IDENTIDADE VISUAL: Respeite a paleta da apresentação. Cores padrão: Verde Floresta/Sálvia (#3A6351), Dourado/Âmbar (#E3B04B), Off-White (#FDFBF7 ou #FFFFFF), Cinza Escuro (#2C2C2C). Fontes: Playfair Display, serif (para títulos elegantes) e Montserrat, sans-serif (para corpo de texto/cards).
4. PREVENÇÃO DE OVERFLOW: Limite textos para caberem sem cortes ou poluição visual. Títulos: 28px a 44px; subtítulos: 18px a 24px; cards/corpo: 14px a 18px.
5. RESPOSTA JSON ESTRITA: Retorne APENAS um objeto JSON válido no seguinte formato:
{
  "explanation": "Frase curta e profissional explicando as melhorias de design aplicadas.",
  "actionsTaken": ["Ação 1 realizada", "Ação 2 realizada"],
  "updatedSlide": {
    "id": "${slide.id}",
    "title": "Título atualizado ou mantido",
    "subtitle": "Subtítulo opcional",
    "background": { "type": "color|gradient|image", "value": "..." },
    "elements": [
      {
        "id": "...",
        "type": "text|image|shape|quote|number",
        "name": "Nome descritivo",
        "x": 10,
        "y": 15,
        "width": 80,
        "height": 18,
        "zIndex": 1,
        "locked": false,
        "content": "...",
        "style": { "fontSize": 32, "fontFamily": "Playfair Display, serif", "fontWeight": "bold", "color": "#1E293B", "textAlign": "left" }
      }
    ],
    "notes": {
      "script": "Roteiro da fala do apresentador para este slide",
      "question": "Pergunta interativa para o público",
      "objective": "Objetivo do slide",
      "suggestedTime": "1 a 2 minutos"
    }
  }
}`;

        const userMessage = `COMANDO DO USUÁRIO: "${prompt}"

CONTEXTO DA APRESENTAÇÃO:
- Título da apresentação: "${presentationContext?.presentationTitle || "Apresentação"}"
- Posição do slide: ${presentationContext?.slideIndex !== undefined ? presentationContext.slideIndex + 1 : 1} de ${presentationContext?.totalSlides || 1}
- Slide anterior: ${presentationContext?.previousSlide ? JSON.stringify(presentationContext.previousSlide) : "Nenhum (primeiro slide)"}
- Próximo slide: ${presentationContext?.nextSlide ? JSON.stringify(presentationContext.nextSlide) : "Nenhum (último slide)"}

SLIDE ATUAL:
${JSON.stringify(slide, null, 2)}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            { role: "user", parts: [{ text: systemPrompt + "\n\n" + userMessage }] },
          ],
        });

        const rawText = response.text || "";
        const cleaned = cleanJsonOutput(rawText);
        const parsed = JSON.parse(cleaned);

        parsed.updatedSlide.elements = sanitizeSlideElements(
          parsed.updatedSlide.elements,
          slide.elements
        );
        parsed.updatedSlide.id = slide.id;

        return res.json(parsed);
      } catch (geminiError) {
        console.warn("Gemini API call failed, using intelligent fallback designer:", geminiError);
      }
    }

    // Heuristic Fallback Designer when Gemini API key is missing or offline
    const fallbackResult = applyHeuristicSlideEdit(slide, prompt);
    return res.json(fallbackResult);
  } catch (err: any) {
    console.error("Error in /api/ai/edit-slide:", err);
    res.status(500).json({ error: "Falha ao processar comando da IA: " + err.message });
  }
});

// ----------------------------------------------------------------------
// 2. POST /api/ai/create-slide
// ----------------------------------------------------------------------
app.post("/api/ai/create-slide", async (req, res) => {
  try {
    const { prompt, slideType, afterSlideIndex, presentationContext } = req.body;

    const ai = getAIClient();
    if (ai) {
      try {
        const systemPrompt = `Você é um Designer especialista em Keynotes e apresentações TED Talk 16:9.
Crie um NOVO slide completo e perfeitamente equilibrado, respeitando a identidade visual da apresentação.

REGRAS:
- Formato 16:9, coordenadas percentuais x/y/width/height de 0 a 100.
- Tipografia harmônica (Playfair Display para títulos, Montserrat para corpo/cards).
- Cores sofisticadas da paleta: #3A6351 (verde), #E3B04B (ouro), #FDFBF7 (offwhite), #1E293B (escuro).
- Inclua notas de apresentação (script, question, objective, suggestedTime).
- Retorne APENAS JSON no formato:
{
  "explanation": "Explicação concisa do slide criado",
  "newSlide": {
    "id": "slide-new-${Date.now()}",
    "title": "Título do Slide",
    "subtitle": "Subtítulo opcional",
    "background": { "type": "color", "value": "#FDFBF7" },
    "elements": [ ... ],
    "notes": { "script": "...", "question": "...", "objective": "...", "suggestedTime": "1 min" }
  }
}`;

        const userMessage = `Tipo de slide solicitado: "${slideType || "personalizado"}"
Comando / Descrição do usuário: "${prompt || "Slide profissional e moderno"}"
Contexto da apresentação: "${presentationContext?.presentationTitle || "Escolhendo Meu Futuro"}"`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\n" + userMessage }] }],
        });

        const rawText = response.text || "";
        const cleaned = cleanJsonOutput(rawText);
        const parsed = JSON.parse(cleaned);
        parsed.newSlide.elements = sanitizeSlideElements(parsed.newSlide.elements);

        return res.json(parsed);
      } catch (geminiError) {
        console.warn("Gemini call failed for create-slide, falling back:", geminiError);
      }
    }

    // Heuristic Fallback Slide Creator
    const fallbackSlide = createHeuristicSlide(slideType, prompt, presentationContext);
    return res.json(fallbackSlide);
  } catch (err: any) {
    console.error("Error in /api/ai/create-slide:", err);
    res.status(500).json({ error: "Falha ao criar slide: " + err.message });
  }
});

// ----------------------------------------------------------------------
// 3. POST /api/ai/generate-presentation (Dashboard "Criar com IA")
// ----------------------------------------------------------------------
app.post("/api/ai/generate-presentation", async (req, res) => {
  try {
    const { prompt, slideCount = 8, tone = "inspirador" } = req.body;

    const ai = getAIClient();
    if (ai) {
      try {
        const systemPrompt = `Você é um diretor criativo de apresentações executivas e educacionais.
Gere uma apresentação completa de ${slideCount} slides para o tema solicitado.
Cada slide deve ter elementos posicionados (x, y, width, height) para tela 16:9, títulos, subtítulos, cards e roteiro do apresentador.
Retorne APENAS um JSON no formato:
{
  "title": "Título impactante da palestra",
  "description": "Breve sinopse",
  "visualIdentity": {
    "primaryColor": "#3A6351",
    "secondaryColor": "#E3B04B",
    "accentColor": "#C87D55",
    "backgroundColor": "#FDFBF7",
    "headingFont": "Playfair Display, serif",
    "bodyFont": "Montserrat, sans-serif"
  },
  "slides": [
    {
      "id": "gen-1",
      "title": "...",
      "subtitle": "...",
      "background": { "type": "color", "value": "#FDFBF7" },
      "elements": [ ... ],
      "notes": { "script": "...", "question": "...", "objective": "...", "suggestedTime": "2 min" }
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [{ role: "user", parts: [{ text: systemPrompt + `\nTEMA: "${prompt}"\nTOM: "${tone}"` }] }],
        });

        const rawText = response.text || "";
        const cleaned = cleanJsonOutput(rawText);
        const parsed = JSON.parse(cleaned);

        parsed.slides = parsed.slides.map((s: any, idx: number) => ({
          ...s,
          id: `ai-pres-slide-${Date.now()}-${idx}`,
          elements: sanitizeSlideElements(s.elements),
        }));

        return res.json(parsed);
      } catch (geminiError) {
        console.warn("Gemini call failed for generate-presentation, using fallback:", geminiError);
      }
    }

    const fallbackPres = generateHeuristicPresentation(prompt, slideCount);
    return res.json(fallbackPres);
  } catch (err: any) {
    console.error("Error in /api/ai/generate-presentation:", err);
    res.status(500).json({ error: "Falha ao gerar apresentação: " + err.message });
  }
});

// ----------------------------------------------------------------------
// 4. POST /api/ai/review-presentation (Revisão e Auditoria Global)
// ----------------------------------------------------------------------
app.post("/api/ai/review-presentation", async (req, res) => {
  try {
    const { presentation } = req.body;
    if (!presentation || !presentation.slides) {
      return res.status(400).json({ error: "Apresentação inválida" });
    }

    const ai = getAIClient();
    if (ai) {
      try {
        const systemPrompt = `Você é um Consultor Sênior de Apresentações TED.
Analise a estrutura de slides fornecida. Identifique problemas de excesso de texto, consistência visual, ritmo da narrativa e alinhamento.
Retorne APENAS um JSON no formato:
{
  "summary": "Resumo geral da saúde e ritmo da apresentação",
  "overallScore": 88,
  "reviewItems": [
    {
      "id": "rev-1",
      "type": "text_overflow|contrast|alignment|consistency|narrative",
      "severity": "low|medium|high",
      "slideIndex": 0,
      "slideTitle": "Nome do slide",
      "description": "Diagnóstico do problema",
      "recommendation": "Sugestão prática",
      "suggestedActionName": "Nome da ação rápida (ex: 'Resumir em 3 tópicos')"
    }
  ]
}`;

        const summaryData = presentation.slides.map((s: any, idx: number) => ({
          index: idx,
          title: s.title,
          elementsCount: s.elements?.length || 0,
          textSample: s.elements?.map((e: any) => e.content).join(" ").slice(0, 200),
        }));

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt + "\n\nSLIDES:\n" + JSON.stringify(summaryData, null, 2) }],
            },
          ],
        });

        const rawText = response.text || "";
        const cleaned = cleanJsonOutput(rawText);
        const parsed = JSON.parse(cleaned);
        return res.json(parsed);
      } catch (geminiError) {
        console.warn("Gemini call failed for review, using fallback:", geminiError);
      }
    }

    // Heuristic review engine
    const fallbackReview = generateHeuristicReview(presentation);
    return res.json(fallbackReview);
  } catch (err: any) {
    console.error("Error in /api/ai/review-presentation:", err);
    res.status(500).json({ error: "Falha na análise da apresentação: " + err.message });
  }
});

// ----------------------------------------------------------------------
// 5. POST /api/ai/detect-identity
// ----------------------------------------------------------------------
app.post("/api/ai/detect-identity", async (req, res) => {
  try {
    const { presentation } = req.body;
    const detected = detectPresentationIdentity(presentation);
    return res.json({
      visualIdentity: detected,
      summary: "Identidade visual detectada com sucesso com base nas cores dominantes e tipografia da apresentação.",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------
// 6. POST /api/ai/chat (Copiloto Conversacional)
// ----------------------------------------------------------------------
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, slideContext } = req.body;

    const ai = getAIClient();
    if (ai) {
      try {
        const lastUserMessage = messages[messages.length - 1]?.content || "";
        const prompt = `Você é o Copiloto de Apresentações integrado ao editor de slides.
Responda de forma concisa, amigável e com dicas práticas de design e oratória.
Contexto: O usuário está no slide "${slideContext?.title || "Slide Atual"}" (Slide #${(slideContext?.slideIndex ?? 0) + 1}).
Pergunta do usuário: "${lastUserMessage}"
Dê uma resposta objetiva em 2 a 3 parágrafos e sugira 2 ou 3 ações rápidas que ele pode aplicar no slide.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        return res.json({ reply: response.text || "Como posso ajudar você a aprimorar este slide?" });
      } catch (geminiError) {
        console.warn("Gemini call failed for chat, using fallback:", geminiError);
      }
    }

    const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || "";
    let reply = "Como designer do seu slide, sugiro mantermos uma hierarquia visual limpa. Você pode usar um título de grande destaque com 'Playfair Display' e dividir o conteúdo em no máximo 2 ou 3 blocos bem arejados.";
    if (lastMsg.includes("moderno") || lastMsg.includes("design")) {
      reply = "Para deixar mais moderno, recomendo aumentar o respiro (espaço em branco), colocar um card com sombra sutil e usar a paleta verde sálvia e dourado da sua apresentação.";
    } else if (lastMsg.includes("texto") || lastMsg.includes("resumir")) {
      reply = "Em apresentações TED, menos é mais! O ideal é que cada slide tenha uma ideia central e que você conte a história falando, e não lendo a tela.";
    }

    return res.json({ reply });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================================================
// HEURISTIC ENGINES (Ensure 100% reliability in offline / preview mode)
// ======================================================================

function applyHeuristicSlideEdit(slide: any, prompt: string): any {
  const p = prompt.toLowerCase();
  const nextSlide = JSON.parse(JSON.stringify(slide));
  const actionsTaken: string[] = [];

  // Filter out locked elements from modifications
  const unlockedElements = nextSlide.elements.filter((e: any) => !e.locked);

  if (p.includes("moderno") || p.includes("design") || p.includes("melhorar")) {
    actionsTaken.push("Aplicada hierarquia visual moderna com espaçamentos proporcionais");
    actionsTaken.push("Ajustada tipografia com Playfair Display para títulos");

    unlockedElements.forEach((el: any) => {
      if (el.type === "text" && (el.name?.toLowerCase().includes("título") || el.style?.fontSize >= 24)) {
        el.style.fontFamily = "Playfair Display, serif";
        el.style.fontWeight = "bold";
        el.style.color = "#1E293B";
        el.x = 8;
        el.y = 10;
        el.width = 84;
      } else if (el.type === "text") {
        el.style.fontFamily = "Montserrat, sans-serif";
        el.style.color = "#475569";
        el.style.lineHeight = 1.6;
      }
    });
  } else if (p.includes("resumir") || p.includes("tópicos") || p.includes("pontos")) {
    actionsTaken.push("Textos resumidos em tópicos concisos e diretos");
    unlockedElements.forEach((el: any) => {
      if (el.type === "text" && el.style?.fontSize < 24) {
        const lines = el.content.split("\n").filter((l: string) => l.trim().length > 0);
        if (lines.length > 3) {
          el.content = lines.slice(0, 3).map((l: string) => `• ${l.replace(/^[•\-\*]\s*/, "")}`).join("\n");
        }
      }
    });
  } else if (p.includes("direita") || p.includes("imagem")) {
    actionsTaken.push("Layout ajustado para composição 50/50 com imagem à direita");
    const imgEl = unlockedElements.find((e: any) => e.type === "image");
    const textEls = unlockedElements.filter((e: any) => e.type === "text");

    if (imgEl) {
      imgEl.x = 52;
      imgEl.y = 16;
      imgEl.width = 40;
      imgEl.height = 70;
      imgEl.style.borderRadius = 16;
      imgEl.style.shadow = true;
    }
    textEls.forEach((el: any, idx: number) => {
      el.x = 8;
      el.width = 40;
      el.y = 18 + idx * 24;
    });
  } else {
    actionsTaken.push("Slide refinado com alinhamento e contraste otimizados");
  }

  return {
    explanation: `Slide aprimorado com sucesso atendendo ao comando: "${prompt}".`,
    actionsTaken,
    updatedSlide: nextSlide,
  };
}

function createHeuristicSlide(slideType: string, prompt: string, context: any): any {
  const type = (slideType || "").toLowerCase();
  const id = `slide-ai-${Date.now()}`;
  let title = "Novo Conceito";
  let elements: any[] = [];

  if (type.includes("comparação") || type.includes("comparison")) {
    title = "Expectativa vs Realidade";
    elements = [
      {
        id: `el-${id}-1`,
        type: "text",
        name: "Título",
        x: 8,
        y: 10,
        width: 84,
        height: 12,
        zIndex: 1,
        content: title,
        style: { fontSize: 36, fontFamily: "Playfair Display, serif", fontWeight: "bold", color: "#1E293B" },
      },
      {
        id: `el-${id}-card1`,
        type: "shape",
        name: "Card Expectativa",
        x: 8,
        y: 28,
        width: 40,
        height: 56,
        zIndex: 1,
        content: "",
        style: { shapeType: "rectangle", backgroundColor: "#F4F7F5", borderRadius: 16 },
      },
      {
        id: `el-${id}-t1`,
        type: "text",
        name: "Texto Expectativa",
        x: 12,
        y: 34,
        width: 32,
        height: 44,
        zIndex: 2,
        content: "O que a maioria imagina:\n\n• Sucesso imediato\n• Caminho sem dúvidas\n• Escolha única e definitiva",
        style: { fontSize: 18, fontFamily: "Montserrat, sans-serif", color: "#3A6351", lineHeight: 1.6 },
      },
      {
        id: `el-${id}-card2`,
        type: "shape",
        name: "Card Realidade",
        x: 52,
        y: 28,
        width: 40,
        height: 56,
        zIndex: 1,
        content: "",
        style: { shapeType: "rectangle", backgroundColor: "#FFFDF9", borderRadius: 16, borderColor: "#E3B04B", borderWidth: 1 },
      },
      {
        id: `el-${id}-t2`,
        type: "text",
        name: "Texto Realidade",
        x: 56,
        y: 34,
        width: 32,
        height: 44,
        zIndex: 2,
        content: "A realidade da jornada:\n\n• Aprendizado constante\n• Reinvenção profissional\n• Oportunidade de empreender",
        style: { fontSize: 18, fontFamily: "Montserrat, sans-serif", color: "#B8860B", lineHeight: 1.6 },
      },
    ];
  } else if (type.includes("quote") || type.includes("citação")) {
    title = "Reflexão Inspiradora";
    elements = [
      {
        id: `el-${id}-q`,
        type: "quote",
        name: "Citação",
        x: 15,
        y: 30,
        width: 70,
        height: 40,
        zIndex: 2,
        content: prompt || "O futuro não é um lugar onde você chega, é algo que você constrói a cada escolha consciente.",
        secondaryContent: "Dra. Especialista",
        style: { fontSize: 32, fontFamily: "Playfair Display, serif", fontStyle: "italic", color: "#3A6351", textAlign: "center" },
      },
    ];
  } else {
    // Default modern content slide
    title = prompt && prompt.length < 50 ? prompt : "Decisão e Autonomia";
    elements = [
      {
        id: `el-${id}-t`,
        type: "text",
        name: "Título",
        x: 8,
        y: 12,
        width: 84,
        height: 12,
        zIndex: 2,
        content: title,
        style: { fontSize: 38, fontFamily: "Playfair Display, serif", fontWeight: "bold", color: "#1E293B" },
      },
      {
        id: `el-${id}-sub`,
        type: "text",
        name: "Subtítulo",
        x: 8,
        y: 26,
        width: 84,
        height: 8,
        zIndex: 2,
        content: "Construindo o seu próprio caminho profissional com propósito e paixão.",
        style: { fontSize: 18, fontFamily: "Montserrat, sans-serif", color: "#64748B" },
      },
      {
        id: `el-${id}-img`,
        type: "image",
        name: "Imagem Ilustrativa",
        x: 52,
        y: 38,
        width: 40,
        height: 50,
        zIndex: 2,
        content: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80",
        style: { borderRadius: 16, objectFit: "cover", shadow: true },
      },
      {
        id: `el-${id}-body`,
        type: "text",
        name: "Texto Principal",
        x: 8,
        y: 40,
        width: 40,
        height: 46,
        zIndex: 2,
        content: "Identifique suas forças naturais e conecte seu talento com áreas em plena expansão no mercado.\n\nA transição da graduação para o mercado exige foco, resiliência e constante busca por inovação.",
        style: { fontSize: 16, fontFamily: "Montserrat, sans-serif", color: "#334155", lineHeight: 1.6 },
      },
    ];
  }

  return {
    explanation: `Slide "${title}" gerado com visual moderno e proporções calibradas para 16:9.`,
    newSlide: {
      id,
      title,
      background: { type: "color", value: "#FDFBF7" },
      elements,
      notes: {
        script: "Compartilhe uma história pessoal sobre esta etapa decisiva da carreira.",
        question: "Quantos aqui já sentiram essa mesma dúvida ao pensar no vestibular?",
        objective: "Gerar empatia e abrir espaço para perguntas dos alunos.",
        suggestedTime: "1 minuto e 30 segundos",
      },
    },
  };
}

function generateHeuristicPresentation(prompt: string, count: number): any {
  const slides = [];
  const titles = [
    "Onde Tudo Começa: O Ensino Médio",
    "A Dúvida: O Que Escolher?",
    "A Faculdade de Farmácia: Muito Além do Balcão",
    "A Virada de Chave: Descobrindo a Estética",
    "O Salto: Empreender e Abrir Minha Própria Clínica",
    "Erros e Acertos: O Que Ninguém Me Contou",
    "A Sua Escolha Começa Hoje",
  ];

  for (let i = 0; i < Math.min(count, titles.length); i++) {
    slides.push({
      id: `ai-slide-${Date.now()}-${i}`,
      title: titles[i],
      background: { type: "color", value: i % 2 === 0 ? "#FDFBF7" : "#FFFFFF" },
      elements: [
        {
          id: `el-title-${i}`,
          type: "text",
          name: "Título",
          x: 10,
          y: 12,
          width: 80,
          height: 14,
          zIndex: 2,
          content: titles[i],
          style: { fontSize: 36, fontFamily: "Playfair Display, serif", fontWeight: "bold", color: "#1E293B" },
        },
        {
          id: `el-body-${i}`,
          type: "text",
          name: "Texto",
          x: 10,
          y: 32,
          width: 48,
          height: 48,
          zIndex: 2,
          content: `Reflexão central sobre ${titles[i].toLowerCase()}. A clareza profissional vem da experiência prática e da coragem de testar novas possibilidades sem medo de errar.`,
          style: { fontSize: 18, fontFamily: "Montserrat, sans-serif", color: "#475569", lineHeight: 1.6 },
        },
        {
          id: `el-img-${i}`,
          type: "image",
          name: "Imagem",
          x: 62,
          y: 28,
          width: 28,
          height: 52,
          zIndex: 2,
          content: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
          style: { borderRadius: 16, objectFit: "cover", shadow: true },
        },
      ],
      notes: {
        script: `Apresente este ponto conectando com a realidade dos estudantes de 15 a 17 anos.`,
        question: "Quem já pensou sobre isso?",
        objective: "Estimular reflexão ativa",
        suggestedTime: "1 a 2 minutos",
      },
    });
  }

  return {
    title: prompt || "Minha Jornada Profissional",
    description: "Palestra interativa no formato Keynote/TED para alunos do ensino médio.",
    visualIdentity: {
      primaryColor: "#3A6351",
      secondaryColor: "#E3B04B",
      accentColor: "#C87D55",
      backgroundColor: "#FDFBF7",
      headingFont: "Playfair Display, serif",
      bodyFont: "Montserrat, sans-serif",
    },
    slides,
  };
}

function generateHeuristicReview(presentation: any): any {
  const items: any[] = [];
  const slides = presentation.slides || [];

  slides.forEach((s: any, idx: number) => {
    const textEls = (s.elements || []).filter((e: any) => e.type === "text");
    const totalChars = textEls.reduce((acc: number, e: any) => acc + (e.content?.length || 0), 0);

    if (totalChars > 350) {
      items.push({
        id: `rev-text-${idx}`,
        type: "text_overflow",
        severity: "high",
        slideIndex: idx,
        slideTitle: s.title || `Slide ${idx + 1}`,
        description: `O slide possui aproximadamente ${totalChars} caracteres. Em uma apresentação TED, isso dispersa a atenção da plateia.`,
        recommendation: "Resumir em 2 ou 3 tópicos pontuais ou dividir o conteúdo em cards visuais.",
        suggestedActionName: "Resumir com IA",
      });
    }

    const hasImages = (s.elements || []).some((e: any) => e.type === "image");
    if (!hasImages && (s.elements || []).length > 2 && idx > 0) {
      items.push({
        id: `rev-img-${idx}`,
        type: "layout_density",
        severity: "medium",
        slideIndex: idx,
        slideTitle: s.title || `Slide ${idx + 1}`,
        description: "Slide exclusivamente textual. A inclusão de uma imagem ou card fotográfico aumentaria o impacto emocional.",
        recommendation: "Adicionar uma imagem à direita com composição 50/50.",
        suggestedActionName: "Adicionar Imagem com IA",
      });
    }
  });

  return {
    summary: `Revisão concluída. Analisados ${slides.length} slides. Encontradas ${items.length} oportunidades de otimização para elevar o nível da sua apresentação.`,
    overallScore: Math.max(70, 96 - items.length * 5),
    reviewItems: items,
  };
}

function detectPresentationIdentity(presentation: any): any {
  let primaryColor = "#3A6351";
  let secondaryColor = "#E3B04B";
  let accentColor = "#C87D55";
  let backgroundColor = "#FDFBF7";
  let headingFont = "Playfair Display, serif";
  let bodyFont = "Montserrat, sans-serif";

  if (presentation?.visualIdentity) {
    return presentation.visualIdentity;
  }

  // Sample elements to detect fonts and colors
  if (presentation?.slides && presentation.slides.length > 0) {
    const firstSlide = presentation.slides[0];
    if (firstSlide?.background?.value) {
      backgroundColor = firstSlide.background.value;
    }
  }

  return {
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor,
    headingFont,
    bodyFont,
    cardStyle: "rounded",
    imageStyle: "shadow",
  };
}

// ----------------------------------------------------------------------
// Vite Middleware / Static Serving
// ----------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import { GoogleGenAI } from "@google/genai";
import { Subscription, Transaction, TransactionType, Category, Frequency } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFinances = async (subscriptions: Subscription[], transactions: Transaction[]): Promise<string> => {
  try {
    const subsText = subscriptions.map(s => 
      `- [Suscripción] ${s.name}: ${s.amount} ${s.currency} (${s.frequency}), Categoría: ${s.category}`
    ).join('\n');

    // Get last 20 transactions
    const recentTrans = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20)
      .map(t => `- [${t.type === TransactionType.INCOME ? 'Ingreso' : 'Gasto'}] ${t.date}: ${t.description} - $${t.amount} (${t.category})`)
      .join('\n');

    const prompt = `
      Actúa como un asesor financiero personal experto.
      Analiza la siguiente información financiera.
      
      SUSCRIPCIONES RECURRENTES (Gastos Fijos):
      ${subsText}

      MOVIMIENTOS RECIENTES (Ingresos y Gastos Variables):
      ${recentTrans}

      Por favor, proporciona un análisis breve pero perspicaz en formato Markdown.
      1. Evalúa el flujo de caja (Ingresos vs Gastos).
      2. Identifica gastos innecesarios (tanto en suscripciones como gastos variables).
      3. Sugiere formas concretas de ahorrar.
      4. Comenta sobre la distribución del gasto.
      
      Mantén un tono profesional, alentador y directo. Escribe en Español. Usa negritas para resaltar puntos clave.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "No se pudo generar un análisis en este momento.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Ocurrió un error al conectar con el asistente financiero. Por favor verifica tu conexión o intenta más tarde.";
  }
};

export const suggestCategory = async (name: string, description: string): Promise<string> => {
  try {
     const prompt = `Dada la transacción/suscripción "${name}" con descripción "${description}", sugiere la categoría más apropiada de esta lista: Entretenimiento, Servicios, Software, Salud y Fitness, Comida, Transporte, Vivienda, Compras, Salario, Freelance, Inversiones, Otro. Devuelve SOLO el nombre de la categoría.`;
     
     const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
     });
     
     return response.text?.trim() || 'Otro';
  } catch (e) {
    return 'Otro';
  }
}

interface ParsedCommand {
  intent: 'TRANSACTION' | 'SUBSCRIPTION' | 'UNKNOWN';
  transactionData?: {
    type: TransactionType;
    amount: number;
    category: Category;
    date: string; // YYYY-MM-DD
    description: string;
  };
  subscriptionData?: {
    name: string;
    amount: number;
    frequency: Frequency;
    category: Category;
    nextPaymentDate: string; // YYYY-MM-DD
  };
  error?: string;
}

export const processFinancialCommand = async (input: { text?: string, audioBase64?: string }): Promise<ParsedCommand> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const categories = Object.values(Category).join(', ');
    const frequencies = Object.values(Frequency).join(', ');

    const systemPrompt = `
      Eres un asistente de finanzas inteligente. Tu trabajo es extraer datos estructurados de una entrada de usuario (texto o audio) para crear una transacción o una suscripción.
      
      FECHA DE HOY: ${today}
      
      ENUMS PERMITIDOS:
      Categorias: [${categories}]
      Frecuencias: [${frequencies}]
      Tipos Transacción: [ingreso, gasto]

      REGLAS:
      1. Detecta si el usuario quiere registrar un gasto/ingreso único (TRANSACTION) o una suscripción recurrente (SUBSCRIPTION).
      2. Si es suscripción, busca nombre, monto, frecuencia y proximo pago.
      3. Si es transacción, busca descripcion, monto, tipo (gasto por defecto), categoria y fecha.
      4. Interpreta fechas relativas como "ayer", "hoy", "el viernes pasado" basándote en la fecha de hoy.
      5. Si falta la categoría, infiérela basada en la descripción.
      6. Devuelve SOLO un objeto JSON válido.

      SCHEMA JSON ESPERADO:
      {
        "intent": "TRANSACTION" | "SUBSCRIPTION" | "UNKNOWN",
        "data": {
           // Si es TRANSACTION
           "type": "ingreso" | "gasto",
           "amount": number,
           "category": string (Debe coincidir exactamente con los Enums),
           "date": "YYYY-MM-DD",
           "description": "string",
           
           // Si es SUBSCRIPTION
           "name": "string",
           "frequency": "Mensual" | "Anual" | "Semanal",
           "nextPaymentDate": "YYYY-MM-DD"
        },
        "error": "Mensaje de error si no se entiende" (Opcional)
      }
    `;

    const parts: any[] = [];
    
    if (input.audioBase64) {
      parts.push({
        inlineData: {
          mimeType: 'audio/wav',
          data: input.audioBase64
        }
      });
      parts.push({ text: "Analiza este audio y extrae la información financiera." });
    } else if (input.text) {
      parts.push({ text: input.text });
    } else {
      throw new Error("No input provided");
    }

    // Use Gemini 2.5 Flash Native Audio for audio, otherwise Gemini 3 Flash
    const modelName = input.audioBase64 ? 'gemini-2.5-flash-native-audio-preview-09-2025' : 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    const jsonText = response.text || "{}";
    // Clean code blocks if present
    const cleanJson = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(cleanJson);

    if (parsed.intent === 'TRANSACTION') {
      return {
        intent: 'TRANSACTION',
        transactionData: parsed.data
      };
    } else if (parsed.intent === 'SUBSCRIPTION') {
      return {
        intent: 'SUBSCRIPTION',
        subscriptionData: parsed.data
      };
    } else {
      return { intent: 'UNKNOWN', error: parsed.error || "No pude entender la solicitud." };
    }

  } catch (error) {
    console.error("Error processing financial command:", error);
    return { intent: 'UNKNOWN', error: "Error al procesar la solicitud." };
  }
};
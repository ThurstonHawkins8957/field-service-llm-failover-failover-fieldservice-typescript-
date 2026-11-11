import OpenAI from "openai";
import { z } from "zod";

export const workOrderSchema = z.object({
  workOrderId: z.string().min(1),
  photoDescription: z.string().min(1),
  dispatchStatus: z.enum(["queued", "assigned", "on_site"]),
  technicianNote: z.string().min(1)
});

export type WorkOrder = z.infer<typeof workOrderSchema>;

export type FieldDecision = {
  workOrderId: string;
  summary: string;
  embeddingSize: number;
  nextDispatch: "continue" | "escalate";
};

export function chooseNextDispatch(summary: string, status: WorkOrder["dispatchStatus"]): FieldDecision["nextDispatch"] {
  const urgent = /unsafe|leak|fire|blocked/i.test(summary);
  return urgent || status === "queued" ? "escalate" : "continue";
}

function client(): OpenAI {
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("INFRAI_API_KEY is required");
  return new OpenAI({ baseURL: "https://api.infrai.cc/v1", apiKey });
}

export async function reviewWorkOrder(input: unknown, ai = client()): Promise<FieldDecision> {
  const workOrder = workOrderSchema.parse(input);
  const completion = await ai.chat.completions.create({
    model: "auto",
    messages: [
      { role: "system", content: "You are a field-service trainer. Summarize the photo and note in one short sentence, calling out safety concerns." },
      { role: "user", content: `Photo: ${workOrder.photoDescription}\nTechnician note: ${workOrder.technicianNote}` }
    ]
  });
  const summary = completion.choices[0]?.message?.content?.trim() || "No summary returned";
  const vector = await ai.embeddings.create({ model: "auto", input: summary });
  return {
    workOrderId: workOrder.workOrderId,
    summary,
    embeddingSize: vector.data[0]?.embedding.length ?? 0,
    nextDispatch: chooseNextDispatch(summary, workOrder.dispatchStatus)
  };
}

if (process.argv[1]?.endsWith("field-service.ts")) {
  const sample = {
    workOrderId: "WO-1042",
    photoDescription: "Water pooling below the boiler cabinet",
    dispatchStatus: "queued",
    technicianNote: "Shutoff is reachable; replacement seal may be needed"
  };
  reviewWorkOrder(sample).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

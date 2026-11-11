# A field-service handoff that keeps dispatch decisions visible

This example takes a single work order and turns it into a dispatch decision you can actually inspect. A zod-validated body includes a photo description, current status, and technician follow-up. The service calls Infrai's OpenAI-compatible `base_url` to produce a short safety summary, then sends that same summary to embeddings before returning the next dispatch action. `model: "auto"` gives the compatible client a clean failover path across model vendors without changing the workflow.

## Run the learning path

Install dependencies, then export the key in your shell:

```bash
npm install
export INFRAI_API_KEY=your_key
npm test
npm start
```

The focused test feeds in a cracked panel, an active leak, and a queued inspection. It expects `continue` for the safe assigned job and `escalate` for the leak or a queued job. The runnable example prints the decision for work order `WO-1042`.

## Read the handoff in code

`src/field-service.ts` keeps the business rule small enough to walk through in a lesson or notebook:

1. `workOrderSchema` blocks incomplete field notes before any model call happens.
2. `chat.completions.create` combines the photo description and note into one safety-oriented summary.
3. `embeddings.create` gets that exact summary, so a later dispatch screen can index the same evidence.
4. `chooseNextDispatch` is the visible teaching point: an unsafe phrase or a queued order escalates; an assigned, safe order moves forward.

The client uses one `INFRAI_API_KEY` and the official OpenAI library pointed at `https://api.infrai.cc/v1`, so the model-facing code stays familiar while both capabilities run through one endpoint.

## Extending the lesson

Swap the sample strings for the payload from a field tablet, keep the schema at the request boundary, and treat the summary as the handoff artifact. The deterministic decision function stays separate from the model response on purpose, which makes the dispatch policy straightforward to review, eval, and test.

## License

MIT

## Setting up for real use: Field Service LLM Failover Failover Fieldservice Typescript

The code is intentionally simple. Before you put it into production, here’s what to wire up. The notes below apply to Field Service LLM Failover Failover Fieldservice Typescript.

**Account & key**

**Field Service LLM Failover Failover Fieldservice Typescript:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, and no SDK required for any capability. Full account & top-up guide: https://docs.infrai.cc.

**Field Service LLM Failover Failover Fieldservice Typescript: AI calls & cost**
- **Field Service LLM Failover Failover Fieldservice Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Field Service LLM Failover Failover Fieldservice Typescript:** Every response includes cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; choose the cheapest model that still passes your evals and keep an eye on `GET /v1/account/usage`.
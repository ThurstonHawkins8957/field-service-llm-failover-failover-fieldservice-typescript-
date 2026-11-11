import assert from "node:assert/strict";
import { chooseNextDispatch, workOrderSchema } from "./field-service.js";

const order = workOrderSchema.parse({
  workOrderId: "WO-7",
  photoDescription: "Cracked panel",
  dispatchStatus: "assigned",
  technicianNote: "Power is isolated"
});

assert.equal(chooseNextDispatch("Cracked panel, safe and dry", order.dispatchStatus), "continue");
assert.equal(chooseNextDispatch("Active leak under the cabinet", order.dispatchStatus), "escalate");
assert.equal(chooseNextDispatch("Routine inspection", "queued"), "escalate");
console.log("field-service decision test passed");

import {
  RegenerateHostsSlotInput,
  regenerateHostsSlot as runSlotGeneration,
} from "../../services/slot.service.js";

export async function regenerateHostSlotsActivity(
  input: RegenerateHostsSlotInput,
) {
  await runSlotGeneration(input);
}

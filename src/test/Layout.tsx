import { Input, InputAddon, InputGroup } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlayerOnTheFloorTable } from "./test-components/PlayerOnFloorTable";

export default function AutoFitGrid() {
  return (
    <main className="grid p-1 grid-cols-1 md:grid-cols-2 gap-2">
      <section>
        <PlayerOnTheFloorTable />
      </section>
      <section>
        <PlayerOnTheFloorTable />
      </section>
    </main>
  );
}

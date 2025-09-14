import { Input, InputAddon, InputGroup } from "@/components/ui/input";
import { PlayerRoster } from "./test-components/PlayerOnFloorTable";
import { TeamDataPerQuarterTable } from "./test-components/TeamDataPerQuarterTable";

export default function AutoFitGrid() {
  return (
    <main className="grid p-1 grid-cols-1 md:grid-cols-2 gap-2">
      <TeamSection />
      <TeamSection />
    </main>
  );
}

function TeamSection() {
  return (
    <section className="grid auto-rows-auto gap-1">
      <PlayerRoster />
      <div className="flex items-center justify-start gap-2">
        <InputGroup>
          <InputAddon variant={"sm"}>Coach Tn</InputAddon>
          <Input type="number" variant={"sm"} />
        </InputGroup>
        <InputGroup>
          <InputAddon variant={"sm"}>None Member Tn</InputAddon>
          <Input type="number" variant={"sm"} />
        </InputGroup>
      </div>
      <TeamDataPerQuarterTable />
      <div className="flex items-center justify-start gap-2">
        <InputGroup>
          <InputAddon variant={"sm"}>Cap't ball</InputAddon>
          <Input variant={"sm"} />
        </InputGroup>
        <InputGroup>
          <InputAddon variant={"sm"}>Turnovers</InputAddon>
          <Input variant={"sm"} />
        </InputGroup>
        <InputGroup>
          <InputAddon variant={"sm"}>FG%</InputAddon>
          <Input variant={"sm"} />
        </InputGroup>
        <InputGroup>
          <InputAddon variant={"sm"}>FG%</InputAddon>
          <Input variant={"sm"} readOnly />
        </InputGroup>
      </div>
    </section>
  );
}

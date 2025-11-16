import type { LeagueAdministator } from "@/types/leagueAdmin";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface Props {
  data: LeagueAdministator;
  dashboard?: boolean;
}

export default function LeagueAdministratorDisplay({
  data,
  dashboard = false,
}: Props) {
  return (
    <div
      className={"w-full rounded-md border p-4 " + (dashboard ? "" : "mt-6")}
    >
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        <div className="flex flex-col items-center md:items-start gap-3 w-full md:w-auto">
          <Avatar className="h-24 w-24 md:h-28 md:w-28 rounded-none aspect-square border shadow">
            <AvatarImage
              src={data.organization_logo_url}
              alt={data.organization_name}
            />
            <AvatarFallback>{data.organization_name.charAt(0)}</AvatarFallback>
          </Avatar>

          <Badge
            variant={data.is_operational ? "default" : "destructive"}
            className="self-center md:self-start"
          >
            {data.is_operational ? "Operational" : "Not Operational"}
          </Badge>
        </div>

        <div className="flex flex-col lg:flex-row justify-between gap-6 flex-1 w-full">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-3">
              {data.organization_name}
            </h2>
            <p className="text-sm opacity-70">{data.organization_type}</p>
          </div>

          {/* Address */}
          <div className="flex-1">
            <p className="text-sm font-semibold">Address</p>
            <p className="text-sm opacity-80 break-words">
              {data.organization_address}
            </p>
          </div>

          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold">Contact</p>
            <p className="text-sm opacity-80 break-all">
              Email: {data.account.email}
            </p>
            <p className="text-sm opacity-80">
              Contact: {data.account.contact_number}
            </p>
            <p className="text-sm opacity-80">
              Account Type: {data.account.account_type}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

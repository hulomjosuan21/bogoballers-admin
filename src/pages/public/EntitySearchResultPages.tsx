import type { Permission } from "@/enums/permission";
import type { QueryResult } from "@/types/searchResults";
import React from "react";
import { Badge } from "@/components/ui/badge";
import type { Player } from "@/types/player";
import type { Team } from "@/types/team";
import type { LeagueAdministator } from "@/types/leagueAdmin";
import type { League } from "@/types/league";
import { useNavigate } from "react-router-dom";

interface BaseSearchResultScreen<T> {
  permissions: Permission[];
  result: T;
}
type SearchResult = Player | Team | LeagueAdministator | League;
interface CustomBadgeProps {
  text: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

const CustomBadge: React.FC<CustomBadgeProps> = ({
  text,
  variant = "default",
}) => {
  return <Badge variant={variant}>{text}</Badge>;
};

interface PlayerSearchResultProps extends BaseSearchResultScreen<Player> {}

const PlayerSearchResultListItem: React.FC<PlayerSearchResultProps> = ({
  result,
}) => {
  const handleClick = () => {};

  return (
    <div
      className="flex items-center p-4 hover:bg-muted cursor-pointer transition-colors"
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mr-3">
        <img
          src={result.profile_image_url}
          alt={result.full_name}
          className="w-12 h-12 rounded-lg object-cover"
        />
      </div>
      <div className="flex-1 flex items-center justify-between min-w-0">
        <div className="flex-1 mr-2">
          <p className="text-sm font-semibold truncate">{result.full_name}</p>
        </div>
        <CustomBadge text="Player" variant="outline" />
      </div>
    </div>
  );
};

interface TeamSearchResultProps extends BaseSearchResultScreen<Team> {}

const TeamSearchResultListItem: React.FC<TeamSearchResultProps> = ({
  result,
}) => {
  const handleClick = () => {};

  return (
    <div
      className="flex items-center p-4 hover:bg-muted cursor-pointer transition-colors"
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mr-3">
        <img
          src={result.team_logo_url}
          alt={result.team_name}
          className="w-12 h-12 rounded-lg object-cover"
        />
      </div>
      <div className="flex-1 flex items-center justify-between min-w-0">
        <div className="flex-1 mr-2">
          <p className="text-sm font-semibold truncate">{result.team_name}</p>
        </div>
        <CustomBadge text="Team" variant="outline" />
      </div>
    </div>
  );
};

interface LeagueAdminSearchResultProps
  extends BaseSearchResultScreen<LeagueAdministator> {}

const LeagueAdministratorSearchResultListItem: React.FC<
  LeagueAdminSearchResultProps
> = ({ result }) => {
  const handleClick = () => {};

  return (
    <div
      className="flex items-center p-4 hover:bg-muted cursor-pointer transition-colors"
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mr-3">
        <img
          src={result.organization_logo_url ?? ""}
          alt={result.organization_name}
          className="w-12 h-12 rounded-lg object-cover"
        />
      </div>
      <div className="flex-1 flex items-center justify-between min-w-0">
        <div className="flex-1 mr-2">
          <p className="text-sm font-semibold truncate">
            {result.organization_name}
          </p>
        </div>
        <CustomBadge text="League Admin" />
      </div>
    </div>
  );
};

interface LeagueSearchResultProps extends BaseSearchResultScreen<League> {}

const LeagueSearchResultListItem: React.FC<LeagueSearchResultProps> = ({
  result,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/league/${result.public_league_id}`);
  };

  return (
    <div
      className="flex items-center p-4 hover:bg-muted cursor-pointer transition-colors"
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mr-3">
        <img
          src={result.banner_url}
          alt={result.league_title}
          className="w-12 h-12 rounded-lg object-cover"
        />
      </div>
      <div className="flex-1 flex items-center justify-between min-w-0">
        <div className="flex-1 mr-2">
          <p className="text-xs font-semibold line-clamp-2">
            {result.league_title}
          </p>
        </div>
        <CustomBadge text="League" />
      </div>
    </div>
  );
};

interface SearchResultItemProps {
  result: SearchResult;
  permissions: Permission[];
  type: "player" | "team" | "league_administrator" | "league";
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  permissions,
  type,
}) => {
  switch (type) {
    case "player":
      return (
        <PlayerSearchResultListItem
          result={result as Player}
          permissions={permissions}
        />
      );
    case "team":
      return (
        <TeamSearchResultListItem
          result={result as Team}
          permissions={permissions}
        />
      );
    case "league_administrator":
      return (
        <LeagueAdministratorSearchResultListItem
          result={result as LeagueAdministator}
          permissions={permissions}
        />
      );
    case "league":
      return (
        <LeagueSearchResultListItem
          result={result as League}
          permissions={permissions}
        />
      );
    default:
      return null;
  }
};

const SearchResultsList: React.FC<{
  results: QueryResult[];
  permissions: Permission[];
}> = ({ results, permissions }) => {
  return (
    <div className="flex flex-col justify-center ">
      {results.map((item, index) => (
        <SearchResultItem
          key={`${item.type}-${index}`}
          result={item.data}
          permissions={permissions}
          type={item.type}
        />
      ))}
    </div>
  );
};

export {
  PlayerSearchResultListItem,
  TeamSearchResultListItem,
  LeagueAdministratorSearchResultListItem,
  LeagueSearchResultListItem,
  SearchResultItem,
  SearchResultsList,
  type BaseSearchResultScreen,
};

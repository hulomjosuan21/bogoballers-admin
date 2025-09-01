import { Input } from "@/components/ui/input";
import { SearchService } from "@/service/search-service";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QueryResultWrapper } from "@/types/search-results";

export default function SearchScreen() {
  const [queryResult, setQueryResult] = useState<QueryResultWrapper | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (searchQuery.trim() === "") return;
    const result = await SearchService.searchEntity(searchQuery);
    setQueryResult(result);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="">
      <nav className="fixed top-0 left-0 py-2 px-4 flex items-center gap-2 border-b w-full bg-background z-10">
        <div className="relative">
          <Input
            ref={inputRef}
            className="peer ps-8 pe-2"
            placeholder="Search..."
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
            <SearchIcon size={16} />
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </nav>

      <section className="mt-14">
        {queryResult && <pre>{JSON.stringify(queryResult, null, 2)}</pre>}
      </section>
    </div>
  );
}

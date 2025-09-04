import { Menu, SearchIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { ModeToggleButton } from "@/components/mode-toggle";

const menuItems = [
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Contact", href: "#link" },
  { name: "About", href: "#link" },
];
const logo = {
  url: "#",
  src: "https://res.cloudinary.com/dod3lmxm6/image/upload/v1756534465/logo-main_nvlqtm.png",
  alt: "logo",
  title: "BogoBallers",
};

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-20 w-full top-0 px-2"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-4 transition-all duration-300 lg:px-6",
            isScrolled &&
              "bg-background/50 max-w-4xl rounded-md border backdrop-blur-lg lg:px-4"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-3 py-2 lg:gap-0 lg:py-3">
            <div className="flex w-full justify-between lg:w-auto">
              <Link to={"/"} className="flex items-center gap-2">
                <img src={logo.src} className="max-h-8" alt={logo.alt} />
                <span className="text-lg font-semibold tracking-tighter">
                  {logo.title}
                </span>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 block p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-4 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.href}
                      className="text-muted-foreground hover:text-accent-foreground block duration-150"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={cn(
                "in-data-[state=active]:block lg:in-data-[state=active]:flex hidden w-full flex-wrap items-center justify-end space-y-4 rounded-md p-3 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-3 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent",
                !isScrolled && "bg-background border",
                isScrolled && "bg-transparent border-0 shadow-none"
              )}
            >
              <div className="lg:hidden">
                <ul className="space-y-4 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-2 sm:flex-row sm:gap-2 sm:space-y-0 md:w-fit">
                <div className="hidden lg:flex items-center gap-2 flex-1">
                  {!isScrolled ? (
                    <div className="relative flex-1">
                      <Input
                        className="peer ps-6 pe-2 w-full"
                        placeholder="Search..."
                        type="search"
                        onFocus={() => setTimeout(() => navigate("/find"), 300)}
                      />
                      <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
                        <SearchIcon size={16} />
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate("/find")}
                    >
                      <SearchIcon size={16} className="me-1" />
                      Search
                    </Button>
                  )}
                  <ModeToggleButton />
                </div>

                <div className="flex lg:hidden items-center gap-2 flex-1">
                  <div className="relative flex-1">
                    <Input
                      className="peer ps-6 pe-2 w-full"
                      placeholder="Search..."
                      type="search"
                      onFocus={() => setTimeout(() => navigate("/find"), 300)}
                    />
                    <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
                      <SearchIcon size={16} />
                    </div>
                  </div>
                  <ModeToggleButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

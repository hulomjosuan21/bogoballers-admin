import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import { type ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "./ui/breadcrumb";
import { Redo, RotateCw, Undo } from "lucide-react";
import { Button } from "./ui/button";

const ON_NEW_WINDOW = import.meta.env.VITE_NEW_WINDOW === "true";

type ContentHeaderProps =
  | { title: string; breadcrumbs?: never; children?: ReactNode }
  | { title?: never; breadcrumbs: string[]; children?: ReactNode };

export default function ContentHeader({
  title,
  breadcrumbs,
  children,
}: ContentHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background flex items-center gap-2 py-1">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        {ON_NEW_WINDOW && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className={"size-7"}
              onClick={() => {
                window.history.back();
              }}
            >
              <Undo />
              <span className="sr-only">Undo Sidebar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={"size-7"}
              onClick={() => {
                window.history.forward();
              }}
            >
              <Redo />
              <span className="sr-only">Redo Sidebar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={"size-7"}
              onClick={() => {
                window.location.reload();
              }}
            >
              <RotateCw />
              <span className="sr-only">Refresh Sidebar</span>
            </Button>
          </>
        )}
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {title && <h1 className="text-base font-medium">{title}</h1>}
        {breadcrumbs && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <div key={index} className="flex items-center">
                    <BreadcrumbItem
                      className={
                        index !== breadcrumbs.length - 1
                          ? "hidden md:block"
                          : ""
                      }
                    >
                      {isLast ? (
                        <BreadcrumbPage>{crumb}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href="#">{crumb}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </div>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <div className="ml-auto flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}

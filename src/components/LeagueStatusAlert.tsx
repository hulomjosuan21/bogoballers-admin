import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { RiNotificationFill, RiSpamFill } from "@remixicon/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import ContentHeader from "./content-header";

interface LeagueStatusAlertProps {
  variant: "warning" | "info" | "success" | "destructive" | "primary";
  icon: ReactNode;
  title: string;
  actionLabel?: string;
  actionHref?: string;
  close?: boolean;
}

export function LeagueStatusAlert({
  variant,
  icon,
  title,
  actionLabel,
  actionHref,
  close = true,
}: LeagueStatusAlertProps) {
  return (
    <Alert variant={variant} close={close}>
      <AlertIcon>{icon}</AlertIcon>
      <AlertTitle>{title}</AlertTitle>

      {actionLabel && actionHref && (
        <AlertToolbar>
          <Button
            asChild
            variant="inverse"
            mode="link"
            underlined="solid"
            size="sm"
            className="flex mt-0.5"
          >
            <Link to={actionHref}>{actionLabel}</Link>
          </Button>
        </AlertToolbar>
      )}
    </Alert>
  );
}

export function NoActiveLeagueAlert({
  message,
  onContentBody = true,
}: {
  message: string;
  onContentBody?: boolean;
}) {
  if (onContentBody) {
    return (
      <ContentShell>
        <ContentHeader title="No Active League" />

        <ContentBody>
          <LeagueStatusAlert
            variant="warning"
            icon={<RiSpamFill />}
            title={message}
            actionLabel="Create League"
            actionHref="/portal/league-administrator/pages/league/new"
            close={false}
          />
        </ContentBody>
      </ContentShell>
    );
  }

  return (
    <LeagueStatusAlert
      variant="warning"
      icon={<RiSpamFill />}
      title={message}
      actionLabel="Create League"
      actionHref="/portal/league-administrator/pages/league/new"
      close={false}
    />
  );
}

export function PendingLeagueAlert({
  onContentBody = true,
}: {
  onContentBody?: boolean;
}) {
  if (onContentBody) {
    return (
      <ContentShell>
        <ContentHeader title="Pending League" />

        <ContentBody>
          <LeagueStatusAlert
            variant="info"
            icon={<RiNotificationFill />}
            title="This league is in Pending status. Continue editing or schedule matches."
            actionLabel="Configure"
            actionHref="/portal/league-administrator/pages/league/active"
            close={true}
          />
        </ContentBody>
      </ContentShell>
    );
  }

  return (
    <LeagueStatusAlert
      variant="info"
      icon={<RiNotificationFill />}
      title="This league is in Pending status. Continue editing or schedule matches."
      actionLabel="Configure"
      actionHref="/portal/league-administrator/pages/league/active"
      close={true}
    />
  );
}

//   const { isActive, league_id, message } = useActiveLeagueMeta();

// if (!isActive) {
//   return (
//       <NoActiveLeagueAlert message={message ?? "No active league found."} />
//   );
// }

// if (isActive && league_status === "Pending") {
//   return (
//       <PendingLeagueAlert />
//   );
// }

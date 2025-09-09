import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RiSpamFill } from "@remixicon/react";
import { useNavigate } from "react-router-dom";

export function NoActiveLeagueAlert() {
  const navigate = useNavigate();
  return (
    <Alert variant="info">
      <AlertIcon>
        <RiSpamFill />
      </AlertIcon>
      <AlertTitle>Start new league.</AlertTitle>
      <AlertToolbar>
        <Button
          variant="inverse"
          mode="link"
          underlined="solid"
          size="sm"
          className="flex mt-0.5"
          onClick={() => navigate("/league-administrator/pages/league/new")}
        >
          Go to creation page
        </Button>
      </AlertToolbar>
    </Alert>
  );
}

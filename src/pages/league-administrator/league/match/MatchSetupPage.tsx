import { useParams } from "react-router-dom";

export default function MatchSetupPage() {
  const { match_id } = useParams();
  return <div className="">{match_id}</div>;
}

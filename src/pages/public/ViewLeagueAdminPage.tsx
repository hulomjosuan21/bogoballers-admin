import { useParams } from "react-router-dom";

export default function PublicViewLeagueAdminPage() {
  const { id } = useParams();

  return <div>{id}</div>;
}

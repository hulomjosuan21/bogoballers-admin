import { Loader2 } from "lucide-react";

export default function ErrorLoading({
  isLoading,
  error,
}: {
  isLoading: boolean;
  error?: Error | null;
}) {
  return (
    <>
      {isLoading ? (
        <div className="centered-container">
          <Loader2 className="spinner-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="centered-container">
          <p className="text-primary">{error.message}</p>
        </div>
      ) : null}
    </>
  );
}

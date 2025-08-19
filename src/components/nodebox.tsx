import type { ReactNode } from "react";

interface NoteBoxProps {
  label?: string;
  children: ReactNode;
}

export const NoteBox = ({ label = "Note", children }: NoteBoxProps) => (
  <div className="rounded bg-muted p-3 text-xs">
    <p>
      <strong>{label}:</strong> {children}
    </p>
  </div>
);

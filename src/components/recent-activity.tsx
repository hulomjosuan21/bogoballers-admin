import * as React from "react";
import { Inbox, File, Send, ArchiveX, Trash2 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const data = {
  navMain: [
    { title: "Inbox", icon: Inbox, isActive: true },
    { title: "Drafts", icon: File, isActive: false },
    { title: "Sent", icon: Send, isActive: false },
    { title: "Junk", icon: ArchiveX, isActive: false },
    { title: "Trash", icon: Trash2, isActive: false },
  ],
  mails: [
    {
      name: "William Smith",
      email: "williamsmith@example.com",
      subject: "Meeting Tomorrow",
      date: "09:34 AM",
      teaser:
        "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
    },
    {
      name: "Alice Smith",
      email: "alicesmith@example.com",
      subject: "Re: Project Update",
      date: "Yesterday",
      teaser:
        "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
    },
    {
      name: "Bob Johnson",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      date: "2 days ago",
      teaser:
        "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
    },
  ],
};

export function RecentActivity() {
  const [activeItem] = React.useState(data.navMain[0]);
  const [mails] = React.useState(data.mails);

  return (
    <Card className="w-full max-w-md overflow-hidden border">
      <CardHeader className="flex flex-col gap-3 border-b">
        <div className="flex w-full items-center justify-between">
          <CardTitle className="text-base font-medium">
            {activeItem?.title}
          </CardTitle>
          <Label className="flex items-center gap-2 text-sm font-normal">
            <span>Unreads</span>
            <Switch className="shadow-none" />
          </Label>
        </div>
        <Input placeholder="Type to search..." className="h-8 text-sm" />
      </CardHeader>
      <CardContent className="p-0">
        {mails.map((mail) => (
          <a
            href="#"
            key={mail.email}
            className="hover:bg-accent hover:text-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight last:border-b-0"
          >
            <div className="flex w-full items-center gap-2">
              <span className="font-medium">{mail.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {mail.date}
              </span>
            </div>
            <span className="font-semibold">{mail.subject}</span>
            <span className="line-clamp-2 w-full text-xs text-muted-foreground whitespace-pre-line">
              {mail.teaser}
            </span>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}

import ContentHeader from "@/components/content-header";
import { Button } from "@/components/ui/button";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { disableOnLoading } from "@/lib/utils";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useDashboardDialog } from "./team/store";


export default function DashboardPage() {
    const { isOpen, dialogOpen, dialogClose } = useDashboardDialog();
    const [loading, setLoading] = useState(false);
    return (
        <ContentShell>
            <ContentHeader title="Dashboard">
                <Button variant={'secondary'} size={'sm'}>Click</Button>
            </ContentHeader>

            <ContentBody className="grid place-content-center">
                <Dialog open={isOpen} onOpenChange={dialogClose}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove your data from our servers.
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
                <div className={disableOnLoading({ condition: loading, baseClass: "text-center", opacity: 50 })}>
                    <h2 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h2>
                    <p className="text-muted-foreground">Here you can manage your league settings, view statistics, and more.</p>
                </div>
                <Button onClick={() => dialogOpen()}>Click</Button>
            </ContentBody>
        </ContentShell>
    )
}

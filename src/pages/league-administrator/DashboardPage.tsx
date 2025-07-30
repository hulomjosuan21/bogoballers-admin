import ContentHeader from "@/components/content-header";
import { Button } from "@/components/ui/button";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { disableOnLoading } from "@/lib/utils";
import { useState } from "react";

export default function DashboardPage() {
    const [loading, setLoading] = useState(false);
    return (
        <ContentShell>
            <ContentHeader title="Dashboard">
                <Button variant={'secondary'} size={'sm'}>Click</Button>
            </ContentHeader>

            <ContentBody className="grid place-content-center">
                <div className={disableOnLoading({ condition: loading, baseClass: "text-center", opacity: 50 })}>
                    <h2 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h2>
                    <p className="text-muted-foreground">Here you can manage your league settings, view statistics, and more.</p>
                </div>
                <Button onClick={() => setLoading(prev => !prev)}>Click</Button>
            </ContentBody>
        </ContentShell>
    )
}

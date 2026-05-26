import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function MajlisLoadingPage() {
  return (
    <main className="safe-container flex min-h-[calc(100vh-5rem)] items-center justify-center py-10">
      <Card className="glass-card rounded-[2rem]">
        <CardContent className="p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
          <p className="mt-3 text-muted-foreground">Loading Majlis...</p>
        </CardContent>
      </Card>
    </main>
  );
}

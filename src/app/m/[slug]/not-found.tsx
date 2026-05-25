import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MajlisNotFoundPage() {
  return (
    <main className="safe-container flex min-h-[calc(100vh-5rem)] items-center justify-center py-10">
      <Card className="glass-card max-w-xl rounded-[2rem] text-center">
        <CardContent className="p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
            <SearchX className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-black text-emerald-950 dark:text-emerald-50">
            മജ്ലിസ് കണ്ടെത്താനായില്ല
          </h1>

          <p className="mt-3 leading-7 text-muted-foreground">
            ഈ ലിങ്ക് തെറ്റായതാകാം, അല്ലെങ്കിൽ മജ്ലിസ് archive ചെയ്തതാകാം.
          </p>

          <Button
            asChild
            className="mt-6 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Link href="/">ഹോമിലേക്ക് പോകുക</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
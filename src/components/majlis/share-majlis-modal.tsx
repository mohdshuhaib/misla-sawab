"use client";

import { useMemo, useState } from "react";
import { LinkIcon, MessageSquareText, Send, Share2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  getShareMessage,
  type ShareActivityType,
} from "@/lib/share/messages";
import { getAppUrl } from "@/lib/utils/app-url";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type ShareMajlisModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityType: ShareActivityType;
  activityLabel: string;
  slug: string;
  forWhom: string;
};

export function ShareMajlisModal({
  open,
  onOpenChange,
  activityType,
  activityLabel,
  slug,
  forWhom,
}: ShareMajlisModalProps) {
  const app = useTranslations("app");
  const share = useTranslations("share");
  const appUrl = useMemo(() => getAppUrl(), []);

  const links = useMemo(() => {
    const majlisLink = `${appUrl}/m/${slug}`;

    return {
      majlisLink,
      khatmulQuranLink: `${majlisLink}/khatmul-quran`,
      dhikrLink: `${majlisLink}/dhikr`,
      yaseenLink: `${majlisLink}/surah-yaseen`,
      fathihaLink: `${majlisLink}/surah-fathiha`,
    };
  }, [appUrl, slug]);

  const selectedLink = useMemo(() => {
    if (activityType === "khatmul_quran") return links.khatmulQuranLink;
    if (activityType === "dhikr") return links.dhikrLink;
    if (activityType === "yaseen") return links.yaseenLink;
    if (activityType === "fathiha") return links.fathihaLink;
    return links.majlisLink;
  }, [activityType, links]);

  const message = useMemo(() => {
    return getShareMessage(activityType, {
      forWhom,
      ...links,
    });
  }, [activityType, forWhom, links]);
  const [editableMessage, setEditableMessage] = useState(message);

  async function copyLink() {
    await navigator.clipboard.writeText(selectedLink);
    toast.success(app("linkCopied"));
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(editableMessage);
    toast.success(app("messageCopied"));
  }

  function shareOnWhatsApp() {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(editableMessage)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  async function nativeShare() {
    if (!navigator.share) {
      shareOnWhatsApp();
      return;
    }

    try {
      await navigator.share({
        title: activityLabel,
        text: editableMessage,
        url: selectedLink,
      });
    } catch {
      // User cancelled native share.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[2rem] border-emerald-100 bg-white/95 p-0 backdrop-blur-xl dark:border-emerald-900 dark:bg-slate-950/95 sm:max-w-2xl">
        <div className="relative overflow-hidden rounded-[2rem]">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-700/10 blur-3xl" />

          <div className="relative p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl font-black text-emerald-950 dark:text-emerald-50">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                  <Share2 className="h-5 w-5" />
                </span>
                {share("modalTitle", { label: activityLabel })}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-6 space-y-5">
              <div>
                <p className="mb-2 text-sm font-semibold text-emerald-950 dark:text-emerald-50">
                  {share("messagePreview")}
                </p>

                <Textarea
                  value={editableMessage}
                  onChange={(event) => setEditableMessage(event.target.value)}
                  className="min-h-72 resize-y rounded-3xl border-emerald-100 bg-emerald-50/70 leading-7 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-50"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-emerald-950 dark:text-emerald-50">
                  {share("directLink")}
                </p>

                <div className="rounded-2xl bg-white/80 p-3 text-sm break-all text-emerald-900 ring-1 ring-emerald-100 dark:bg-slate-950/50 dark:text-emerald-100 dark:ring-emerald-900">
                  {selectedLink}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  className="h-auto min-h-12 rounded-2xl bg-emerald-600 px-4 py-3 whitespace-normal text-white hover:bg-emerald-700"
                  onClick={copyMessage}
                >
                  <MessageSquareText className="mr-2 h-4 w-4" />
                  <span className="min-w-0 break-words">{share("copyMessage")}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-auto min-h-12 rounded-2xl px-4 py-3 whitespace-normal"
                  onClick={copyLink}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  <span className="min-w-0 break-words">{share("copyLink")}</span>
                </Button>

                <Button
                  type="button"
                  className="h-auto min-h-12 rounded-2xl bg-green-600 px-4 py-3 whitespace-normal text-white hover:bg-green-700"
                  onClick={shareOnWhatsApp}
                >
                  <Send className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-auto min-h-12 rounded-2xl px-4 py-3 whitespace-normal"
                  onClick={nativeShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  <span className="min-w-0 break-words">{share("mobileShare")}</span>
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="h-auto min-h-12 w-full rounded-2xl px-4 py-3 whitespace-normal"
                onClick={() => onOpenChange(false)}
              >
                <X className="mr-2 h-4 w-4" />
                <span className="min-w-0 break-words">{share("close")}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

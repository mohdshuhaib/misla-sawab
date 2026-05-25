"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  BookOpen,
  Check,
  Clipboard,
  Copy,
  HeartHandshake,
  Loader2,
  LockKeyhole,
  MessageCircleHeart,
  Sparkles,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Image from "next/image";

import {
  createMajlis,
  type CreateMajlisResult,
  type MajlisActivity,
} from "@/lib/majlis/create-majlis";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAppUrl } from "@/lib/utils/app-url";
import { BRAND } from "@/lib/constants/brand";

const activityOptions: {
  value: MajlisActivity;
  label: string;
  description: string;
  icon: typeof BookOpen;
}[] = [
    {
      value: "khatmul_quran",
      label: "ഖത്ത്മുൽ ഖുർആൻ",
      description: "30 ജുസ് തിരഞ്ഞെടുത്ത് ഖത്തം പൂർത്തിയാക്കുക",
      icon: BookOpen,
    },
    {
      value: "dhikr",
      label: "ദിക്റ് / അദ്കാർ",
      description: "ദിക്റ് തരം, എണ്ണം, മൊത്തം കണക്ക്",
      icon: MessageCircleHeart,
    },
    {
      value: "yaseen",
      label: "സൂറത്ത് യാസീൻ",
      description: "യാസീൻ പാരായണ എണ്ണം രേഖപ്പെടുത്തുക",
      icon: HeartHandshake,
    },
    {
      value: "fathiha",
      label: "സൂറത്തുൽ ഫാത്തിഹ",
      description: "ഫാത്തിഹ പാരായണ എണ്ണം രേഖപ്പെടുത്തുക",
      icon: Sparkles,
    },
  ];

const formSchema = z.object({
  title: z.string().optional(),
  purpose: z
    .string()
    .min(2, "നിയ്യത്ത് / ഉദ്ദേശ്യം നൽകുക")
    .max(160, "ഉദ്ദേശ്യം വളരെ നീളമാണ്"),
  forWhom: z
    .string()
    .min(2, "ആർക്കുവേണ്ടിയാണെന്ന് നൽകുക")
    .max(160, "പേര് വളരെ നീളമാണ്"),
  description: z.string().max(1000, "വിവരണം വളരെ നീളമാണ്").optional(),
  activities: z
    .array(z.enum(["fathiha", "yaseen", "khatmul_quran", "dhikr"]))
    .min(1, "കുറഞ്ഞത് ഒരു പ്രവർത്തനം തിരഞ്ഞെടുക്കുക"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateMajlisModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [createdMajlis, setCreatedMajlis] =
    useState<CreateMajlisResult | null>(null);

  const isOpen = searchParams.get("create") === "majlis";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      purpose: "",
      forWhom: "",
      description: "",
      activities: ["khatmul_quran", "dhikr"],
    },
  });

  const appUrl = useMemo(() => getAppUrl(), []);
  const t = useTranslations("create");
  const app = useTranslations("app");
  const activitiesText = useTranslations("activities");

  const publicLink = createdMajlis
    ? `${appUrl}/m/${createdMajlis.slug}`
    : "";

  const managerLink = createdMajlis
    ? `${appUrl}/manager/${createdMajlis.slug}#token=${createdMajlis.managerToken}`
    : "";

  function closeModal() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("create");

    const nextUrl = params.toString() ? `${pathname}?${params}` : pathname;
    router.replace(nextUrl);

    setCreatedMajlis(null);
    form.reset({
      title: "",
      purpose: "",
      forWhom: "",
      description: "",
      activities: ["khatmul_quran", "dhikr"],
    });
  }

  async function copyText(text: string, successMessage: string) {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  }

  async function onSubmit(values: FormValues) {
    try {
      const result = await createMajlis({
        title: values.title,
        purpose: values.purpose,
        forWhom: values.forWhom,
        description: values.description,
        defaultLanguage: "ml",
        activities: values.activities,
      });

      setCreatedMajlis(result);
      toast.success(app("linkCopied"));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "മജ്ലിസ് സൃഷ്ടിക്കാൻ കഴിഞ്ഞില്ല";

      toast.error(message);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[2rem] border-emerald-100 bg-white/95 p-0 backdrop-blur-xl dark:border-emerald-900 dark:bg-slate-950/95 sm:max-w-2xl">
        <div className="relative overflow-hidden rounded-[2rem]">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-700/10 blur-3xl" />

          <div className="relative p-6 sm:p-8">
            <DialogHeader>
              <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-3xl bg-white shadow-lg shadow-emerald-600/20 ring-1 ring-emerald-100">
                <Image
                  src={BRAND.logo}
                  alt={`${BRAND.name} Logo`}
                  fill
                  sizes="64px"
                  className="object-contain p-2"
                />
              </div>

              <DialogTitle className="text-2xl font-black text-emerald-950 dark:text-emerald-50">
                {t("title")}
              </DialogTitle>

              <DialogDescription className="text-base leading-7">
                {t("description")}
              </DialogDescription>
            </DialogHeader>

            {createdMajlis ? (
              <CreatedMajlisResult
                publicLink={publicLink}
                managerLink={managerLink}
                onCopy={copyText}
                onClose={closeModal}
              />
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-8 space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="forWhom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("forWhom")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("forWhomPlaceholder")}
                            className="h-12 rounded-2xl"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          മരണപ്പെട്ട വ്യക്തിയുടെ പേര് അല്ലെങ്കിൽ പ്രത്യേക
                          ഉദ്ദേശ്യം നൽകാം.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("purpose")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("purposePlaceholder")}
                            className="h-12 rounded-2xl"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          ഈ മജ്ലിസ് ഏത് നിയ്യത്തോടെയാണ് ആരംഭിക്കുന്നത്?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("majlisName")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("majlisNamePlaceholder")}
                            className="h-12 rounded-2xl"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          ഉദാ: മർഹൂം അബ്ദുള്ള അവർക്കുവേണ്ടിയുള്ള ഖത്ത്മുൽ
                          ഖുർആൻ മജ്ലിസ്
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("descriptionLabel")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("descriptionPlaceholder")}
                            className="min-h-28 rounded-2xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="activities"
                    render={({ field }) => (
                      <FormItem>
                        <div>
                          <FormLabel>{t("activitiesLabel")}</FormLabel>
                          <FormDescription>
                            തിരഞ്ഞെടുക്കുന്ന പ്രവർത്തനങ്ങൾ മാത്രമേ പൊതുജനങ്ങൾക്ക്
                            കാണിക്കൂ.
                          </FormDescription>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {activityOptions.map((activity) => {
                            const Icon = activity.icon;
                            const checked = field.value?.includes(activity.value);

                            function toggleActivity() {
                              const currentValue = field.value || [];

                              if (checked) {
                                field.onChange(
                                  currentValue.filter((value) => value !== activity.value)
                                );
                              } else {
                                field.onChange([...currentValue, activity.value]);
                              }
                            }

                            const activityLabel =
                              activity.value === "khatmul_quran"
                                ? activitiesText("khatmulQuran")
                                : activity.value === "dhikr"
                                  ? activitiesText("dhikr")
                                  : activity.value === "yaseen"
                                    ? activitiesText("yaseen")
                                    : activitiesText("fathiha");

                            return (
                              <div
                                key={activity.value}
                                role="checkbox"
                                aria-checked={checked}
                                tabIndex={0}
                                onClick={toggleActivity}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    toggleActivity();
                                  }
                                }}
                                className={cn(
                                  "flex min-h-24 cursor-pointer items-start gap-3 rounded-3xl border p-4 text-left transition",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                                  checked
                                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                                    : "border-emerald-100 bg-white/60 hover:bg-emerald-50"
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                                    checked
                                      ? "bg-emerald-600 text-white"
                                      : "bg-emerald-100 text-emerald-700"
                                  )}
                                >
                                  <Icon className="h-5 w-5" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="font-bold text-emerald-950">
                                      {activityLabel}
                                    </p>

                                    <span
                                      className={cn(
                                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                                        checked
                                          ? "border-emerald-600 bg-emerald-600 text-white"
                                          : "border-emerald-300 bg-white"
                                      )}
                                      aria-hidden="true"
                                    >
                                      {checked ? <Check className="h-3.5 w-3.5" /> : null}
                                    </span>
                                  </div>

                                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                    {activity.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 rounded-full"
                      onClick={closeModal}
                    >
                      {t("cancel")}
                    </Button>

                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="h-12 rounded-full bg-emerald-600 px-7 text-white hover:bg-emerald-700"
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("creating")}
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          {t("submit")}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type CreatedMajlisResultProps = {
  publicLink: string;
  managerLink: string;
  onCopy: (text: string, successMessage: string) => Promise<void>;
  onClose: () => void;
};

function CreatedMajlisResult({
  publicLink,
  managerLink,
  onCopy,
  onClose,
}: CreatedMajlisResultProps) {
  return (
    <div className="mt-8 space-y-5">
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/40">
        <div className="mb-3 flex items-center gap-2 text-emerald-800 dark:text-emerald-100">
          <Check className="h-5 w-5" />
          <p className="font-bold">മജ്ലിസ് വിജയകരമായി സൃഷ്ടിച്ചു</p>
        </div>

        <p className="text-sm leading-6 text-muted-foreground">
          ഈ public link WhatsApp ഗ്രൂപ്പിൽ share ചെയ്യാം. Manager link
          സ്വകാര്യമായി മാത്രം സൂക്ഷിക്കുക.
        </p>
      </div>

      <div className="space-y-3 rounded-3xl border border-emerald-100 bg-white/70 p-5 dark:border-emerald-900 dark:bg-slate-950/40">
        <p className="font-bold text-emerald-950 dark:text-emerald-50">
          Public Majlis Link
        </p>

        <div className="rounded-2xl bg-emerald-50 p-3 text-sm break-all text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100">
          {publicLink}
        </div>

        <Button
          type="button"
          className="w-full rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={() => onCopy(publicLink, "ലിങ്ക് കോപ്പി ചെയ്തു")}
        >
          <Copy className="mr-2 h-4 w-4" />
          Public Link Copy ചെയ്യുക
        </Button>
      </div>

      <div className="space-y-3 rounded-3xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-100">
          <LockKeyhole className="h-5 w-5" />
          <p className="font-bold">Private Manager Link</p>
        </div>

        <p className="text-sm leading-6 text-amber-900/80 dark:text-amber-100/80">
          ഈ ലിങ്ക് സ്വകാര്യമായി സൂക്ഷിക്കുക. ഇത് ഉപയോഗിച്ച് മജ്ലിസ് archive
          ചെയ്യാനും തെറ്റായ contributions remove ചെയ്യാനും കഴിയും.
        </p>

        <div className="rounded-2xl bg-white/70 p-3 text-sm break-all text-amber-950 dark:bg-slate-950/40 dark:text-amber-100">
          {managerLink}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full border-amber-300 bg-white/70 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
          onClick={() => onCopy(managerLink, "Manager link copied")}
        >
          <Clipboard className="mr-2 h-4 w-4" />
          Manager Link Copy ചെയ്യുക
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          asChild
          className="h-12 flex-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <a href={publicLink}>Public Majlis തുറക്കുക</a>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-12 flex-1 rounded-full"
          onClick={onClose}
        >
          അടയ്ക്കുക
        </Button>
      </div>
    </div>
  );
}
export type ShareActivityType =
  | "full"
  | "khatmul_quran"
  | "dhikr"
  | "yaseen"
  | "fathiha";

export type ShareMessageInput = {
  forWhom: string;
  majlisLink: string;
  khatmulQuranLink?: string;
  dhikrLink?: string;
  yaseenLink?: string;
  fathihaLink?: string;
};

const salam = "السلام عليكم ورحمة الله وبركاته";

export function getFullMajlisShareMessage(input: ShareMessageInput) {
  return `${salam}

നമ്മുടെ പ്രിയപ്പെട്ട ${input.forWhom} മഗ്ഫിറത്തും മർഹമത്തും ലഭിക്കട്ടെ എന്ന നിയ്യത്തോടെ നാം ഒരു നന്മയുടെ മജ്ലിസ് ആരംഭിക്കുകയാണ്.

ഇൻഷാ അല്ലാഹ്, സാധിക്കുന്ന എല്ലാവരും താഴെ നൽകിയിരിക്കുന്ന ലിങ്കിൽ പ്രവേശിച്ച് തങ്ങളാൽ കഴിയുന്ന രീതിയിൽ ഖുർആൻ പാരായണം, ദിക്ർ തുടങ്ങിയ അമലുകളിൽ പങ്കാളികളാകുക.

നമ്മുടെ ഓരോ ചെറിയ നന്മകളും വലിയ അമലുകളായി അല്ലാഹു അവർക്കെത്തിച്ചു കൊടുക്കുമാറാകട്ടെ. ആമീൻ.

${input.majlisLink}`;
}

export function getKhatmulQuranShareMessage(input: ShareMessageInput) {
  return `${salam}

നമ്മുടെ പ്രിയപ്പെട്ട ${input.forWhom} മഗ്ഫിറത്തും മർഹമത്തും ലഭിക്കട്ടെ എന്ന നിയ്യത്തോടെ നാം ഒരു നന്മയുടെ മജ്ലിസ് ആരംഭിക്കുകയാണ്.

ഇൻഷാ അല്ലാഹ്, സാധിക്കുന്ന എല്ലാവരും താഴെ നൽകിയ ലിങ്കിൽ പ്രവേശിച്ച് തങ്ങളാൽ കഴിയുന്ന രീതിയിൽ ജുസ് തിരഞ്ഞെടുക്കുക.

നമ്മുടെ ഓരോ ചെറിയ നന്മകളും വലിയ അമലുകളായി അല്ലാഹു അവർക്കെത്തിച്ചു കൊടുക്കുമാറാകട്ടെ. ആമീൻ.

${input.khatmulQuranLink}`;
}

export function getDhikrShareMessage(input: ShareMessageInput) {
  return `${salam}

നമ്മുടെ പ്രിയപ്പെട്ട ${input.forWhom} മഗ്ഫിറത്തും മർഹമത്തും ലഭിക്കട്ടെ എന്ന നിയ്യത്തോടെ നാം ഒരു നന്മയുടെ മജ്ലിസ് ആരംഭിക്കുകയാണ്.

ഇൻഷാ അല്ലാഹ്, സാധിക്കുന്ന എല്ലാവരും കഴിയുന്നത്ര ദിക്റ് ചൊല്ലി താഴെ നൽകിയ ലിങ്കിൽ നിങ്ങളുടെ പങ്കാളിത്തം രേഖപ്പെടുത്തുക.

നമ്മുടെ ഓരോ ചെറിയ നന്മകളും വലിയ അമലുകളായി അല്ലാഹു അവർക്കെത്തിച്ചു കൊടുക്കുമാറാകട്ടെ. ആമീൻ.

${input.dhikrLink}`;
}

export function getYaseenShareMessage(input: ShareMessageInput) {
  return `${salam}

നമ്മുടെ പ്രിയപ്പെട്ട ${input.forWhom} മഗ്ഫിറത്തും മർഹമത്തും ലഭിക്കട്ടെ എന്ന നിയ്യത്തോടെ നാം ഒരു നന്മയുടെ മജ്ലിസ് ആരംഭിക്കുകയാണ്.

ഇൻഷാ അല്ലാഹ്, സാധിക്കുന്ന എല്ലാവരും താഴെ നൽകിയ ലിങ്കിൽ പ്രവേശിച്ച് നിങ്ങൾക്ക് കഴിയുന്നത്ര സൂറത്ത് യാസീൻ പാരായണം രേഖപ്പെടുത്തുക.

നമ്മുടെ ഓരോ ചെറിയ നന്മകളും വലിയ അമലുകളായി അല്ലാഹു അവർക്കെത്തിച്ചു കൊടുക്കുമാറാകട്ടെ. ആമീൻ.

${input.yaseenLink}`;
}

export function getFathihaShareMessage(input: ShareMessageInput) {
  return `${salam}

നമ്മുടെ പ്രിയപ്പെട്ട ${input.forWhom} മഗ്ഫിറത്തും മർഹമത്തും ലഭിക്കട്ടെ എന്ന നിയ്യത്തോടെ നാം ഒരു നന്മയുടെ മജ്ലിസ് ആരംഭിക്കുകയാണ്.

ഇൻഷാ അല്ലാഹ്, സാധിക്കുന്ന എല്ലാവരും താഴെ നൽകിയ ലിങ്കിൽ പ്രവേശിച്ച് നിങ്ങൾക്ക് കഴിയുന്നത്ര സൂറത്ത് ഫാതിഹ + ഇഖ്ലാസ് + ഫലഖ് + നാസ് പാരായണം രേഖപ്പെടുത്തുക.

നമ്മുടെ ഓരോ ചെറിയ നന്മകളും വലിയ അമലുകളായി അല്ലാഹു അവർക്കെത്തിച്ചു കൊടുക്കുമാറാകട്ടെ. ആമീൻ.

${input.fathihaLink}`;
}

export function getShareMessage(
  activityType: ShareActivityType,
  input: ShareMessageInput
) {
  if (activityType === "khatmul_quran") {
    return getKhatmulQuranShareMessage(input);
  }

  if (activityType === "dhikr") {
    return getDhikrShareMessage(input);
  }

  if (activityType === "yaseen") {
    return getYaseenShareMessage(input);
  }

  if (activityType === "fathiha") {
    return getFathihaShareMessage(input);
  }

  return getFullMajlisShareMessage(input);
}

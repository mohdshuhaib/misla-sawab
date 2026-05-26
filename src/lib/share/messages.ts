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

നമ്മുടെ പ്രിയപ്പെട്ട ${input.forWhom} അവർക്കുവേണ്ടി ഒരു നന്മയുടെ മജ്ലിസ് ആരംഭിച്ചിരിക്കുന്നു.

ഇൻഷാ അല്ലാഹ്, താൽപര്യമുള്ള എല്ലാവരും താഴെ നൽകിയ ലിങ്കിൽ പ്രവേശിച്ച് നിങ്ങൾക്ക് കഴിയുന്ന രീതിയിൽ ഖുർആൻ പാരായണം, ദിക്റ്, അല്ലെങ്കിൽ മറ്റ് അമലുകളിൽ പങ്കാളികളാകുക.

ഒരു ചെറിയ പങ്കാളിത്തം പോലും വലിയൊരു നന്മയായി മാറട്ടെ. അല്ലാഹു ഈ അമൽ ഖബൂൾ ചെയ്യുമാറാകട്ടെ. ആമീൻ.

${input.majlisLink}`;
}

export function getKhatmulQuranShareMessage(input: ShareMessageInput) {
  return `${salam}

നമ്മുടെ പ്രിയപ്പെട്ട ${input.forWhom} അവർക്കുവേണ്ടി ഒരു ഖത്ത്മുൽ ഖുർആൻ പാരായണ മജ്ലിസ് ആരംഭിച്ചിരിക്കുന്നു.

ഇൻഷാ അല്ലാഹ്, താൽപര്യമുള്ള എല്ലാവരും താഴെ നൽകിയ ലിങ്കിൽ പ്രവേശിച്ച് നിങ്ങൾക്ക് പാരായണം ചെയ്യാൻ കഴിയുന്ന ജുസ് തിരഞ്ഞെടുക്കുക.

ചെറിയൊരു പങ്കാളിത്തം പോലും വലിയൊരു നന്മയായി മാറട്ടെ. അല്ലാഹു നമ്മുടെ എല്ലാവരുടെയും അമലുകൾ ഖബൂൾ ചെയ്യുമാറാകട്ടെ. ആമീൻ.

${input.khatmulQuranLink}`;
}

export function getDhikrShareMessage(input: ShareMessageInput) {
  return `${salam}

നമ്മുടെ പ്രിയപ്പെട്ട ${input.forWhom} അവർക്കുവേണ്ടി ഒരു ദിക്റ് / അദ്കാർ മജ്ലിസ് ആരംഭിച്ചിരിക്കുന്നു.

ഇൻഷാ അല്ലാഹ്, നിങ്ങൾക്ക് കഴിയുന്നത്ര ദിക്റ് ചൊല്ലി താഴെ നൽകിയ ലിങ്കിൽ നിങ്ങളുടെ പങ്കാളിത്തം രേഖപ്പെടുത്തുക.

നമ്മുടെ ചെറിയ അമലുകളും അല്ലാഹുവിന്റെ അടുക്കൽ വലിയ പ്രതിഫലമായി മാറട്ടെ. അല്ലാഹു ഖബൂൾ ചെയ്യുമാറാകട്ടെ. ആമീൻ.

${input.dhikrLink}`;
}

export function getYaseenShareMessage(input: ShareMessageInput) {
  return `${salam}

നമ്മുടെ പ്രിയപ്പെട്ട ${input.forWhom} അവർക്കുവേണ്ടി ഒരു സൂറത്ത് യാസീൻ പാരായണ മജ്ലിസ് ആരംഭിച്ചിരിക്കുന്നു.

ഇൻഷാ അല്ലാഹ്, താൽപര്യമുള്ള എല്ലാവരും താഴെ നൽകിയ ലിങ്കിൽ പ്രവേശിച്ച് നിങ്ങൾക്ക് കഴിയുന്നത്ര സൂറത്ത് യാസീൻ പാരായണം രേഖപ്പെടുത്തുക.

അല്ലാഹു നമ്മുടെ എല്ലാവരുടെയും അമലുകൾ ഖബൂൾ ചെയ്യുമാറാകട്ടെ. ആമീൻ.

${input.yaseenLink}`;
}

export function getFathihaShareMessage(input: ShareMessageInput) {
  return `${salam}

A Fathiha + Ikhlas + Falaq + Naas recitation Majlis has been started for our beloved ${input.forWhom}.

Insha Allah, please open the link below and record as many Fathiha + Ikhlas + Falaq + Naas recitations as you can.

May Allah accept this good deed. Ameen.

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

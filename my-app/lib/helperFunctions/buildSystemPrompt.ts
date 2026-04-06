export function buildSystemPrompt( selectedModel: "gpt-image-1.5" | "flux-2-pro" ){
    const modellNote = selectedModel === "flux-2-pro" ? [
          "Bildemotoren etterpå er FLUX: skriv positivt og konkret (hva som skal skje), unngå lange lister med «ikke» og «unngå».",
          "Ikke bruk egen «negative prompt»-stil; beskriv heller tydelig ønsket plassering og størrelse.",
        ].join(" ")
      : [
          "Bildemotoren etterpå er GPT Image: du kan være tydelig på at miljøet skal beholdes og at produktet skal plasseres med riktig skala og skygge.",
        ].join(" ");

        return [
    "Du hjelper med å skrive én kort, presis BRUKERINSTRUKSJON for plassering av produkter i et allerede generert miljøbilde.",
    "Output skal KUN være selve instruksjonsteksten som skal limes inn i et tekstfelt – ingen hilsen, ingen markdown, ingen nummererte titler, ingen anførselstegn rundt hele teksten.",
    "Målet er realistisk plassering og dimensjon: bruk synlige ting i scenen som størrelsesanker (møbler, benk, hus, fliser, plen, vinduer, døråpning, terrasseheller, osv.).",
    "Produktlisten i brukermeldingen er den FULLSTENDIGE og ENESTE kilden: nevn nøyaktig de produkttypene og antall som står der (f.eks. ett krus og én tallerken). Ikke gjenta eldre bestillinger (f.eks. «to krus») hvis listen sier noe annet. Ikke finn på produkter som ikke står i listen.",
    "SKALA (viktig): Velg riktig type anker etter scene:",
    "- Kjøkken / spisebord / små gjenstander (krus, tallerken, glass, skål): bruk typisk hverdagsstørrelse – ikke «store rekvisitter». Ankre mot blandebatteri, flisstørrelse, benkebredde eller avstand mellom kran og kant: f.eks. at krusets høyde er tydelig lavere enn blandebatteriet, tallerkenens diameter omtrent som én flis eller mindre enn halve benkefeltet. Unngå å beskrive dem som overdrevet store.",
    "- Baderom / servantbenk (DYBDE – ofte oversett): En lang benk har både «bakkant» (inntil speilet/flisveggen bak kranen), «midt på flaten» og «forkant» (nærmest kamera). En stor tom flate til venstre/høyre er ikke nødvendigvis bakkant. Uten eksplisitt dybde legger bilde-modeller ofte produktet i den ledige sonen som er mest salient i bildet (ofte forkant eller siden mot kamera). Hvis brukeren vil ha produktet i bakkant, skriv det tydelig, f.eks.: «Plasser produktet i bakkant av servantbenken, med bunnflate mot speilet/flisene langs veggen, mellom kran og speil – ikke på forkanten av benken mot kamera og ikke bare «på den tomme siden» uten å angi dybde.»",
    "- Store utendørs gjenstander (trampolin, basseng, lekegrind): angi troverdig voksen-/hage-skala med anker mot hus, terrasse, plen (se tidligere eksempler).",
    "- Alltid minst to konkrete sammenligninger med motivet i bildet, tilpasset om det er innendørs småting eller utendørs store ting.",
    "Miljøbildet skal forstås som låst: ikke be om ny himmel, nye møbler eller redesign av rommet – bare hvor produktet skal stå og omtrent hvor stort i forhold til omgivelsene.",
    modellNote,
  ].join("\n");
}
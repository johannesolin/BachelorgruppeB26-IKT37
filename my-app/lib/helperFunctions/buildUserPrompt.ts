export function buildUserPrompt( scenePrompt: string, productSummary: string): string{
    const text = [
        "Dette gjelder KUN det valgte miljøet og produktlisten under. Ikke gjenta eller anta plassering for tidligere produkter eller andre scener som ikke er beskrevet her.",
        "",
        "## Miljø (fra mal / kontekst)",
        scenePrompt,
        "",
        "## Produkter som skal inn (følg denne listen ordrett – rekkefølge 1 = hovedprodukt)",
        productSummary,
  ];

  text.push(
    "",
    "Krav til den ferdige teksten:",
    "- Beskriv plassering for hvert produkt i listen med riktig navn/type fra listen (ikke bytt ut tallerken med krus eller omvendt).",
    "- Minst to eksplisitte størrelsesankre mot motivet i miljøbeskrivelsen. På kjøkken: kran, flis, benk – ikke overdriv størrelsen på krus/tallerken.",
    "- Ved store utendørs produkter: realistiske mål i forhold til menneskehøyde og typisk hageutstyr.",
    "",
    "Skriv nå den ferdige plasseringsinstruksen på norsk (2–8 korte avsnitt eller punktliste i ren tekst)."
  );

  return text.join("\n");
}
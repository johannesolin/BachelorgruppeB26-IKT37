import { PlacementPreset } from "./types";

export const PLACMENT_PRESET: PlacementPreset[] = [
    {
    id: "hage",
    label: "Hage / uteplass",
    text: [
      "Sett hovedproduktet på den åpne flaten i forgrunnen eller mellomgrunnen (plen, terrasse, belegg) der det allerede er ledig plass i bildet.",
      "Velg størrelse ut fra hus, rekkverk, potter eller annen synlig referanse i bildet, slik at produktet passer perspektivet mot huset og horisonten.",
      "La produktet ha kontakt med underlaget og en diskret skygge der det står. Ikke beskriv endringer i himmel, fjell, hus eller annen bakgrunn – bare hvor produktet skal stå og omtrent hvor stort.",
    ].join("\n\n"),
  },
  {
    id: "stue",
    label: "Stue / oppholdsrom",
    text: [
      "Sett hovedproduktet på gulv eller annen tydelig flate (teppe, gulv, lav bordplate) som allerede synes i bildet.",
      "Velg størrelse ut fra møbler, listverk eller døråpning i bildet, i tråd med rommets perspektiv.",
      "La skygge følge lyset som allerede er i rommet. Ikke be om nye møbler, nye vegger eller annen omrokering – bare plassering og størrelse på produktet.",
    ].join("\n\n"),
  },
  {
    id: "kjokken",
    label: "Kjøkken",
    text: [
      "Sett produktene på benkeplate eller øy som allerede synes, med naturlig kontaktflate mot platen.",
      "Skala for krus, tallerken og lignende skal være vanlig serveringsstørrelse – ikke større enn at et krus typisk er lavere enn blandebatteriet, og en tallerken omtrent som én synlig flis i bredden eller tydelig mindre enn halvparten av benkefeltet foran kranen.",
      "Ankre eksplisitt mot noe i bildet: blandebatteriets høyde, flisstørrelse, benkebredde eller avstand kran–kant.",
      "Ikke endre kjøkkeninnredning eller vinduer – kun plassering og realistisk størrelse på produktene.",
    ].join("\n\n"),
  },
  {
    id: "generell",
    label: "Generell (nøytral)",
    text: [
      "Sett hovedproduktet på den mest naturlige horisontale flaten i bildet der det er plass uten å skjule viktige motiver.",
      "Velg størrelse ut fra synlige ting i miljøbildet (møbler, dører, gulv, vegger) slik at volum og perspektiv blir troverdige.",
      "Beskriv kun plassering og størrelse for produktet – ikke nye elementer i scenen eller generelle endringer av miljøet.",
    ].join("\n\n"),
  },
  {
    id: "ute_stort",
    label: "Store utendørs (trampolin m.m.)",
    text: [
      "Plasser produktet sentralt på plenen i forgrunnen/mellomgrunnen med fot på gresset og naturlig skygge mot bakken.",
      "Skala som voksen hageutstyr, ikke miniatyr: typisk rund trampolin har hoppeflate omtrent 3 m i diameter (tilpass hvis produktet ser annerledes ut på referansebildet). Sikkerhetsnett og stolper skal være tydelig høyere enn en stående person – gjerne at nett/stolpetopp ligger i samme høydeområde som underkant eller midtre del av husets vinduer i bildet, justert etter perspektiv.",
      "Sammenlign bredden med synlige ting: for eksempel omtrent så bred som utesofaen er lang, eller at hele produktet spenner over en tilsvarende bredde som terrassehellen ved huset.",
      "Ikke endre hus, fjell, himmel eller øvrig plen – kun innsetting av produktet med korrekt volum.",
    ].join("\n\n"),
  },
]
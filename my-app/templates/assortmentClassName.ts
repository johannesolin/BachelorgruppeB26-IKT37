const RAW_OPTIONS = [
  "Grunnsortiment",
  "Sesongvare",
  "Reservedeler",
  "Kampanjevare",
  "Markedsartikler",
  "Eksport",
  "Netthandel",
  "Tillegg",
  "Regnskapartikler",
  "null",
];

export const ASSORTMENTCLASSNAME = RAW_OPTIONS.map((c) => ({
    value: c,
    label: c,
}));


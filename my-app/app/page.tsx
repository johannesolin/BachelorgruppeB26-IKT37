"use client";
// Importering av React-hooks og komponenter som er nødvendige for siden
import React, { useEffect, useMemo, useState } from "react";
import { DashboardNav } from "./navigation/DashboardNav";
import styles from "./page.module.css";
import { getStoredTheme, saveTheme } from "../lib/theme";

/*
 * Typedefinisjon for Template-objekter.
 * En template kan enten være av type "hard" (med forhåndsdefinert bildefil)
 * eller type "soft" (generert basert på tekstlig prompt).
 */

type Template =
  | { id: string; name: string; type: "hard"; baseScene: { assetPath: string } }
  | {
      id: string;
      name: string;
      type: "soft";
      scenePrompt: string;
      size?: string;
      quality?: string;
    };

/*
 * Typedefinisjon for SelectedProduct.
 * Representerer enten et opplastet produkt (last-opp) eller et produkt fra database (produktId).
 */

type SelectedProduct =
  | { kind: "last-opp"; id: string; file: File; previewUrl: string }
  | {
      kind: "produktId";
      id: string;
      productId: string;
      name?: string;
      bestHref?: string;
    };

/*
 * Typedefinisjon for respons fra generate-APIet.
 * Inneholder enten resulterende data-URLer eller en feilmelding.
 */

type GenerateResponse = { resultDataUrls?: string[]; error?: string };

/*
 * Typedefinisjon for respons fra produktoppslagings-APIet.
 * Inneholder produktinformasjon eller feilmelding.
 */

type ProductLookupResponse = {
  found?: boolean;
  product?: { productId: string; name: string; categoryName?: string };
  bestHref?: string | null;
  error?: string;
};

/*
 * Hjelpefunksjon som konverterer en ukjent feil til en lesbar feilmelding.
 * Hvis feilen er en Error-instans, returneres dens melding, ellers konverteres den til string.
 */

function toErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/*
 * Genererer en unik identifikator ved bruk av globalThis.crypto.randomUUID()
 * eller en fallback-løsning basert på tidsstempel og tilfeldig tall.
 */

function uuid(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

/*
 * Leser feilmelding fra API-respons.
 * Prøver først å parse responsen som JSON, og returnerer error-feltet hvis det finnes,
 * ellers returneres hele teksten eller bare HTTP-statuskoden.
 */

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  if (!text) return `HTTP ${res.status}`;
  try {
    const j = JSON.parse(text) as { error?: string };
    return j.error ?? text;
  } catch {
    return text;
  }
}

/*
 * Hovedkomponent for dashbordet.
 * Håndterer alle aspekter av miljøbilde- og produktplasseringsflyten,
 * inkludert template-valg, scenemanipulasjon, produktvalg og generering av endelige bilder.
 */

export default function Page() {
  // State for templates og valgt template
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState<string>("");

  // State for scenebildet som skal brukes som bakgrunn
  const [sceneUrl, setSceneUrl] = useState<string>("");
  const [sceneBlob, setSceneBlob] = useState<Blob | null>(null);

  // State for lastetilstander og feilmeldinger
  const [busyScene, setBusyScene] = useState(false);
  const [busyGen, setBusyGen] = useState(false);
  const [err, setErr] = useState<string>("");

  // State for scenefiksing (scene refinement)
  const [sceneFixPrompt, setSceneFixPrompt] = useState("");

  // State for produktvalg
  const [productIdInput, setProductIdInput] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );

  // State for plasseringsinstruksjoner
  const [placementPrompt, setPlacementPrompt] = useState<string>("");

  // State for generering av resultater
  const [variants, setVariants] = useState<number>(4);
  const [resultDataUrls, setResultDataUrls] = useState<string[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number>(0);

  // State for mørkt/lyst tema
  const [darkMode, setDarkModeState] = useState<boolean>(true);

  /*
   * Laster lagret tema fra localStorage ved komponentens montering.
   */

  useEffect(() => {
    const storedTheme = getStoredTheme();
    setDarkModeState(storedTheme === "dark");
  }, []);

  /*
   * Setter mørkt/lyst tema og lagrer valget i localStorage.
   */

  const setDarkMode = (isDark: boolean) => {
    setDarkModeState(isDark);
    saveTheme(isDark ? "dark" : "light");
  };

  /*
   * Memoized valg av gjeldende template basert på templateId.
   * Oppdateres kun når templates eller templateId endres.
   */

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) ?? null,
    [templates, templateId],
  );

  /*
   * Hjelpefunksjon som setter scene fra en Blob.
   * Håndterer opprydding av tidligere objektURLer for å unngå minnelekk.
   */

  function setSceneFromBlob(blob: Blob) {
    setSceneBlob(blob);
    setSceneUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
  }

  /*
   * Cleanup-effekt som frigjør alle objektURLer når komponenten demonteres.
   * Dette forhindrer minnelekkasje fra både scene og opplastede produkter.
   */

  useEffect(() => {
    return () => {
      if (sceneUrl) URL.revokeObjectURL(sceneUrl);
      selectedProducts.forEach((p) => {
        if (p.kind === "last-opp") URL.revokeObjectURL(p.previewUrl);
      });
    };
  }, []);

  /*
   * Effekt som oppdaterer document-nivåets colorScheme basert på darkMode.
   * Dette påvirker innebygde form-elementer og andre browserkomponenter.
   */

  useEffect(() => {
    if (darkMode) {
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.style.colorScheme = "light";
    }
  }, [darkMode]);

  /*
   * Henter tilgjengelige templates fra API ved komponentens montering.
   * Setter automatisk første template som valgt hvis det finnes noen.
   */

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/templates");
      const json = (await res.json()) as Template[];
      setTemplates(json);
      if (json.length) setTemplateId(json[0].id);
    })();
  }, []);

  /*
   * Laster scenebildet for en gitt template.
   * Håndterer både "hard" templates (forhåndsdefinerte bilder)
   * og "soft" templates (genererte bilder basert på prompt).
   * Tilbakestiller resultater ved lasting av ny scene.
   */

  async function loadSceneForTemplate(tid: string) {
    const t = templates.find((x) => x.id === tid);
    if (!t) return;

    // Nullstill tidligere resultater
    setErr("");
    setResultDataUrls([]);
    setSelectedVariant(0);
    setSceneBlob(null);
    setSceneUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });

    setBusyScene(true);
    try {
      if (t.type === "hard") {
        // For hard templates: hent forhåndsdefinert bildefil fra API
        const res = await fetch(
          `/api/template-image?templateId=${encodeURIComponent(tid)}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error(await readErrorMessage(res));
        const blob = await res.blob();
        setSceneFromBlob(blob);
      } else {
        // For soft templates: generer bilde basert på template-prompt
        const res = await fetch("/api/scene", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId: tid }),
        });
        if (!res.ok) throw new Error(await readErrorMessage(res));
        const blob = await res.blob();
        setSceneFromBlob(blob);
      }
    } finally {
      setBusyScene(false);
    }
  }

  /*
   * Effekt som trigger sceneinnlasting når templateId eller templates endres.
   */

  useEffect(() => {
    if (!templateId) return;
    loadSceneForTemplate(templateId).catch((e) => setErr(toErrorMessage(e)));
  }, [templateId, templates]);

  /*
   * Fjerner et produkt fra listen over valgte produkter.
   * Frigjør objektURL hvis det er en opplastet fil.
   */

  function removeProduct(id: string) {
    setSelectedProducts((prev) => {
      const p = prev.find((x) => x.id === id);
      if (p?.kind === "last-opp") URL.revokeObjectURL(p.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  }

  /*
   * Flytter et produkt opp eller ned i listen.
   * Retningen angis med -1 (opp) eller 1 (ned).
   * Validerer grensene slik at produktet ikke flyttes ut av listen.
   */

  function moveProduct(id: string, dir: -1 | 1) {
    setSelectedProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(nextIdx, 0, item);
      return copy;
    });
  }

  /*
   * Setter et produkt som hovedprodukt ved å flytte det til første posisjon i listen.
   * Hovedproduktet får spesiell behandling ved bildegenering.
   */

  function setMain(id: string) {
    setSelectedProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.unshift(item);
      return copy;
    });
  }

  /*
   * Legger til et produkt basert på ProduktID fra input-feltet.
   * Validerer at:
   * - Input-verdien ikke er tom
   * - Antall valgte produkter ikke overstiger 4
   * - Produktet finnes i databasen via API-kall
   */

  async function addProductId() {
    try {
      setErr("");
      const pid = productIdInput.trim();
      if (!pid) throw new Error("Skriv produktId");
      if (selectedProducts.length >= 4) throw new Error("Maks 4 produkter");

      // Slå opp produkt via API
      const res = await fetch(
        `/api/products/by-id?productId=${encodeURIComponent(pid)}`,
      );
      const json = (await res.json()) as ProductLookupResponse;
      if (!res.ok) throw new Error(json.error || "produkt henting feilet");
      if (!json.found) throw new Error("Fant ikke produkt");

      // Legg til produkt i liste
      setSelectedProducts((prev) => [
        ...prev,
        {
          kind: "produktId",
          id: uuid(),
          productId: pid,
          name: json.product?.name,
          bestHref: json.bestHref ?? undefined,
        },
      ]);

      // Tøm input-feltet etter vellykket tillegg
      setProductIdInput("");
    } catch (e) {
      setErr(toErrorMessage(e));
    }
  }

  /*
   * Legger til produkter basert på fileopplastinger fra bruker.
   * Validerer at:
   * - Filene er av godkjent type (PNG, JPEG, WebP)
   * - Antall valgte produkter ikke overstiger 4 totalt
   * Opprettet forhåndsvisninger for hver fil vises i brukergrensesnittet.
   */

  function addUploads(files: FileList | null) {
    if (!files) return;
    setErr("");
    const incoming = Array.from(files);

    setSelectedProducts((prev) => {
      // Beregn hvor mange filer som kan legges til (max 4 totalt)
      const room = 4 - prev.length;
      const take = incoming.slice(0, room);

      // Opprett forhåndsvisnings-URLs for hver fil
      const mapped: SelectedProduct[] = take.map((f) => ({
        kind: "last-opp",
        id: uuid(),
        file: f,
        previewUrl: URL.createObjectURL(f),
      }));
      return [...prev, ...mapped];
    });
  }

  /*
   * Regenererer scenen for soft templates ved å kalle på API for å hente en helt ny scene.
   * Brukes når bruker ønsker en annen variant av samme template-stil.
   */

  async function regenerateScene() {
    try {
      if (!selectedTemplate) throw new Error("Ingen template valgt");
      if (selectedTemplate.type !== "soft")
        throw new Error("Regenerering gjelder kun soft templates");
      await loadSceneForTemplate(templateId);
    } catch (e) {
      setErr(toErrorMessage(e));
    }
  }

  /*
   * Finjusterer en eksisterende scene basert på brukerens tekstuelle instruksjon.
   * Sender scenebildet og instruksjonen til API som modifiserer bildet accordingly.
   */

  async function refineScene() {
    try {
      setErr("");
      if (!sceneBlob) throw new Error("Ingen scene å endre");
      if (!sceneFixPrompt.trim()) throw new Error("Skriv hva du vil endre");

      setBusyScene(true);

      // Opprett FormData med scene og instruksjon
      const fd = new FormData();
      fd.append("instruction", sceneFixPrompt.trim());
      fd.append(
        "scene",
        new File([sceneBlob], "scene.png", {
          type: sceneBlob.type || "image/png",
        }),
      );

      // Send til API for scene-modifisering
      const res = await fetch("/api/scene-refine", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));

      // Sett den modifiserte scenen
      const blob = await res.blob();
      setSceneFromBlob(blob);

      // Tøm instruksjonsfelt etter vellykket operasjon
      setSceneFixPrompt("");
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusyScene(false);
    }
  }

  /*
   * Genererer det endelige bildet med produkter plassert i scenen.
   * Validerer at:
   * - Scene er lastet
   * - 1-4 produkter er valgt
   * - Plasseringsinstruksjon er gitt
   * Sender alle nødvendige data til API for bildegenering.
   */

  async function generate() {
    try {
      setErr("");
      setResultDataUrls([]);
      setSelectedVariant(0);

      // Valider inputs
      if (!sceneBlob) throw new Error("Miljøbilde er ikke klart ennå");
      if (selectedProducts.length < 1 || selectedProducts.length > 4)
        throw new Error("Velg 1–4 produkter");
      if (!placementPrompt.trim()) throw new Error("Skriv en placement prompt");

      setBusyGen(true);

      // Opprett ordnet referanseliste over produkter
      const orderedRefs = selectedProducts.map((p) =>
        p.kind === "produktId"
          ? ({ kind: "produktId", value: p.productId } as const)
          : ({ kind: "last-opp", value: p.file.name } as const),
      );

      // Filtrer ut kun opplastede produkter
      const uploads = selectedProducts.filter(
        (p): p is Extract<SelectedProduct, { kind: "last-opp" }> =>
          p.kind === "last-opp",
      );

      // Opprett FormData for API-kall
      const fd = new FormData();
      fd.append("placementPrompt", placementPrompt);
      fd.append("variants", String(variants));
      fd.append("orderedRefs", JSON.stringify(orderedRefs));

      // Legg ved scenebildet
      fd.append(
        "scene",
        new File([sceneBlob], "scene.png", {
          type: sceneBlob.type || "image/png",
        }),
      );

      // Legg ved alle opplastede produktfiler
      uploads.forEach((u) => fd.append("produkter", u.file));

      // Send til API for generering
      const res = await fetch("/api/generate", { method: "POST", body: fd });
      const json = (await res.json()) as GenerateResponse;
      if (!res.ok) throw new Error(json.error || "generering feilet");

      // Lagre genererte resultater
      setResultDataUrls(json.resultDataUrls ?? []);
      setSelectedVariant(0);
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusyGen(false);
    }
  }

  /*
   * Returnerer JSX for hele dashbord-siden.
   * DashboardNav mottar darkMode og setDarkMode for temakontroll.
   * Siden er organisert i to hovedseksjoner: konfigurering (venstre) og resultater (høyre).
   */
  return (
    <>
      <DashboardNav darkMode={darkMode} onDarkModeChange={setDarkMode} />

      <main className={styles.main}>
        <h1>Miljøbilde + produktplassering</h1>

        <div className={styles.Miljøbilde}>
          <section
            className={`${styles.configSection} ${
              darkMode ? styles.dark : styles.light
            }`}
          >
            <h2
              className={`${styles.heading2} ${darkMode ? styles.dark : styles.light}`}
            >
              Velg miljø
            </h2>

            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className={`${styles.select} ${darkMode ? styles.dark : styles.light}`}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.type})
                </option>
              ))}
            </select>

            <div className={styles.sceneContainer}>
              <div className={styles.sceneLabel}>Miljøbilde</div>
              {busyScene ? (
                <div className={styles.sceneBusyLoader}>
                  Laster/genererer...
                </div>
              ) : sceneUrl ? (
                <>
                  <img
                    src={sceneUrl}
                    alt="scene"
                    className={styles.sceneImage}
                  />

                  {selectedTemplate?.type === "soft" && (
                    <>
                      <button
                        onClick={regenerateScene}
                        disabled={busyScene || busyGen}
                        className={styles.button}
                      >
                        Regenerer scene
                      </button>

                      <div className={styles.sceneContainer}>
                        <div className={styles.sceneLabel}>
                          Hva vil du endre i scenen?
                        </div>
                        <input
                          value={sceneFixPrompt}
                          onChange={(e) => setSceneFixPrompt(e.target.value)}
                          placeholder='F.eks: "Ta bort dusjen. Behold alt annet uendret."'
                          className={`${styles.input} ${styles.inputMargin} ${
                            darkMode ? styles.dark : styles.light
                          }`}
                        />
                        <button
                          onClick={refineScene}
                          disabled={
                            busyScene || busyGen || !sceneFixPrompt.trim()
                          }
                          className={styles.button}
                        >
                          Fiks scene
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className={styles.sceneEmpty}>Ingen scene</div>
              )}
            </div>

            <h2
              className={`${styles.heading2Large} ${styles.heading2} ${
                darkMode ? styles.dark : styles.light
              }`}
            >
              Velg 1–4 produkter
            </h2>
            <div
              className={`${styles.descriptionText} ${
                darkMode ? styles.dark : styles.light
              }`}
            >
              Skriv inn Produktnummer eller ProduktID
            </div>

            <div className={styles.flexContainer}>
              <input
                value={productIdInput}
                onChange={(e) => setProductIdInput(e.target.value)}
                placeholder="Produktnummer Her..."
                className={`${styles.input} ${styles.flex1} ${
                  darkMode ? styles.dark : styles.light
                }`}
              />
              <button
                onClick={addProductId}
                disabled={selectedProducts.length >= 4}
              >
                Legg til
              </button>
            </div>

            <div
              className={`${styles.flexContainerStart} ${styles.flexContainer}`}
            >
              <div
                className={`${styles.fileListContainer} ${
                  darkMode ? styles.dark : styles.light
                } ${
                  selectedProducts.filter((p) => p.kind === "last-opp").length >
                  0
                    ? styles.filled
                    : styles.empty
                }`}
              >
                {selectedProducts.filter((p) => p.kind === "last-opp")
                  .length === 0
                  ? "Velg Fil fra Datamaskin. (Ingen fil valgt)"
                  : selectedProducts
                      .filter((p) => p.kind === "last-opp")
                      .map((p) => (
                        <div
                          key={p.id}
                          className={`${styles.fileItem} ${
                            darkMode ? styles.dark : styles.light
                          }`}
                        >
                          {p.kind === "last-opp" && p.file.name}
                        </div>
                      ))}
              </div>
              <label className={styles.fileLabel}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const input = document.querySelector(
                      'input[type="file"][data-file-input]',
                    ) as HTMLInputElement;
                    input?.click();
                  }}
                  className={`${styles.buttonCompact} ${
                    darkMode
                      ? styles.buttonCompactDark
                      : styles.buttonCompactLight
                  }`}
                  onMouseEnter={(e) => {
                    e.currentTarget.classList.add(
                      darkMode
                        ? styles.buttonCompactDarkHover
                        : styles.buttonCompactLightHover,
                    );
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.classList.remove(
                      darkMode
                        ? styles.buttonCompactDarkHover
                        : styles.buttonCompactLightHover,
                    );
                  }}
                >
                  Legg til fil
                </button>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => addUploads(e.target.files)}
                  disabled={selectedProducts.length >= 4}
                  data-file-input
                  className={styles.fileInput}
                />
              </label>
            </div>

            {selectedProducts.length > 0 && (
              <div
                className={`${styles.productList} ${
                  darkMode ? styles.dark : styles.light
                }`}
              >
                <div className={styles.productGrid}>
                  {selectedProducts.map((p, idx) => (
                    <div key={p.id} className={styles.productCard}>
                      <div className={styles.productCardHeader}>
                        <div className={styles.productCardLabel}>
                          {p.kind === "last-opp"
                            ? idx === 0
                              ? "Hovedbilde"
                              : idx === 1
                                ? "Sekundærbilde"
                                : idx === 2
                                  ? "Tredje-bilde"
                                  : "Fjerde-bilde"
                            : `${p.productId}${p.name ? ` – ${p.name}` : ""}`}
                        </div>

                        <div className={styles.productCardButtonGroup}>
                          <button
                            onClick={() => moveProduct(p.id, -1)}
                            disabled={idx === 0}
                            title="Flytt opp"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveProduct(p.id, 1)}
                            disabled={idx === selectedProducts.length - 1}
                            title="Flytt ned"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeProduct(p.id)}
                            title="Fjern"
                          >
                            X
                          </button>
                        </div>
                      </div>

                      {p.kind === "last-opp" ? (
                        <img
                          src={p.previewUrl}
                          alt="last-opp"
                          className={styles.productImage}
                        />
                      ) : p.bestHref ? (
                        <img
                          src={p.bestHref}
                          alt="dbx"
                          className={styles.productImage}
                        />
                      ) : (
                        <div className={styles.productNoHref}>
                          Ingen bestHref
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2
              className={`${styles.heading2Large} ${styles.heading2} ${
                darkMode ? styles.dark : styles.light
              }`}
            >
              ØNSKET PLASSERING PÅ PRODUKT(ENE)
            </h2>
            <textarea
              value={placementPrompt}
              onChange={(e) => setPlacementPrompt(e.target.value)}
              rows={6}
              placeholder="Eks: Plasser produktet i sentrum av bordet. Orienter det mot venstre. Produktet skal være lettsynlig og dominere komposisjonen."
              className={`${styles.textarea} ${darkMode ? styles.dark : styles.light}`}
            />

            <div className={styles.variantsContainer}>
              <label className={styles.flex1}>
                <div className={styles.variantsLabel}>Varianter</div>
                <select
                  value={variants}
                  onChange={(e) => setVariants(Number(e.target.value))}
                  className={`${styles.select} ${darkMode ? styles.dark : styles.light}`}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                </select>
              </label>

              <button
                onClick={generate}
                disabled={busyGen || busyScene}
                className={`${styles.button} ${styles.flex1} ${styles.flexEnd}`}
              >
                {busyGen ? "Genererer..." : "Generer"}
              </button>
            </div>

            {err && <div className={styles.errorMessage}>{err}</div>}
          </section>

          <section
            className={`${styles.resultSection} ${
              darkMode ? styles.dark : styles.light
            }`}
          >
            <h2
              className={`${styles.heading2} ${darkMode ? styles.dark : styles.light}`}
            >
              Resultat
            </h2>

            {resultDataUrls.length === 0 ? (
              <div className={styles.noResults}>Ingen resultat ennå</div>
            ) : (
              <>
                <img
                  src={resultDataUrls[selectedVariant]}
                  alt="selected-result"
                  className={styles.resultImage}
                />

                <h3
                  className={`${styles.heading3} ${
                    darkMode ? styles.dark : styles.light
                  }`}
                >
                  Velg beste variant
                </h3>
                <div className={styles.variantsGrid}>
                  {resultDataUrls.map((u, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariant(i)}
                      className={`${styles.variantButton} ${
                        i === selectedVariant
                          ? styles.variantButtonActive
                          : styles.variantButtonInactive
                      }`}
                    >
                      <img
                        src={u}
                        alt={`variant-${i}`}
                        className={styles.variantImage}
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}


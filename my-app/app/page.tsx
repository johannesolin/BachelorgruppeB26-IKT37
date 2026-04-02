"use client";
// Importering av React-hooks og komponenter som er nødvendige for siden
import { useEffect, useState } from "react";
import { DashboardNav } from "./navigation/DashboardNav";
import styles from "./page.module.css";
import { getStoredTheme, saveTheme } from "../lib/theme";
import { Product } from "@/db/types";
import { SelectProductCard } from "@/components/SelectProductCard";
import { templatesArray } from "@/templates/templates";
import { Template } from "@/templates/types";
import { EnvironmentCard } from "@/components/EnvironmentCard";
import { ResultsCard } from "@/components/ResultsCard";

/*
 * Typedefinisjon for Template-objekter.
 * En template kan enten være av type "hard" (med forhåndsdefinert bildefil)
 * eller type "soft" (generert basert på tekstlig prompt).
 */

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
  // State for modell valg
  const [selectedModel, setSelectedModel] = useState<string>("");


  // State for templates og valgt template
  const [templates, setTemplates] = useState<Template[]>(templatesArray as Template[]);
  const [templateId, setTemplateId] = useState<string>(templates[0].id as string);

  // State for scenebildet som skal brukes som bakgrunn
  const [sceneUrl, setSceneUrl] = useState<string>("");
  const [sceneTemplate, setSceneTemplate] = useState<Template | null>(null);
  const [sceneBlob, setSceneBlob] = useState<Blob | null>(null);

  // State for lastetilstander og feilmeldinger
  const [busyScene, setBusyScene] = useState(false);
  const [busyGen, setBusyGen] = useState(false);
  const [err, setErr] = useState<string>("");

  // State for scenefiksing (scene refinement)
  const [sceneFixPrompt, setSceneFixPrompt] = useState("");

  // State for produktvalg
  const [productIdInput, setProductIdInput] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // State for plasseringsinstruksjoner
  const [placementPrompt, setPlacementPrompt] = useState<string>("");

  // State for generering av resultater
  const [variants, setVariants] = useState<number>(1);
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
   * Laster scenebildet for en gitt template.
   * Håndterer både "hard" templates (forhåndsdefinerte bilder)
   * og "soft" templates (genererte bilder basert på prompt).
   * Tilbakestiller resultater ved lasting av ny scene.
   */

  async function generateScene(){
    setBusyScene(true);
    const temp = templates.find(temp => temp.id === templateId) as Template;
    const form = new FormData();      

    form.append("size", String(temp.size));
    form.append("prompt", String(temp.scenePrompt).trim());    
    form.append("quality", String(temp.quality));

    let respons;
    
    if(selectedModel === "gpt-image-1.5"){
      respons = await fetch("/api/openAi/generateEnvironment", {
        method: "POST",
        body: form,
      });
    } else {
      respons = await fetch("/api/flux2Pro/generateEnvironment", {
        method: "POST",
        body: form,
      });
    }

    const data = await respons.json();    
    setSceneUrl(data);
    setSceneTemplate(temp);
    setBusyScene(false);
  }

  async function refineScene() {
    setBusyScene(true);
    const form = new FormData();
    form.append("size", String(sceneTemplate?.size));
    form.append("prompt", String(sceneFixPrompt).trim());    
    form.append("quality", String(sceneTemplate?.quality));
    form.append("scene", sceneUrl);

    let respons;
    if(selectedModel === "gpt-image-1.5"){
      respons = await fetch("/api/openAi/editEnvironment", {
        method: "POST",
        body: form,
      });
    } else {
      respons = await fetch("/api/flux2Pro/editEnvironment", {
        method: "POST",
        body: form,
      });
    }

    const data = await respons.json();
    if(data.length > 0) setSceneUrl(data);
    setBusyScene(false);
  }

  async function placeProductsInScene() {
    setBusyGen(true);
    const form = new FormData();
    form.append("prompt", String(placementPrompt).trim());
    form.append("variants", String(variants));
    form.append("scene", sceneUrl);
    form.append("productCount", String(selectedProducts.length));    
    for(let i = 0; i < selectedProducts.length; i++){
        form.append(`product${i}`, selectedProducts[i].images[selectedProducts[i].selectedImage].href);
    }

    let respons;
    if(selectedModel === "gpt-image-1.5"){
      respons = await fetch("/api/openAi/productInEnvironment", {
        method: "POST",
        body: form,
      })
    } else {
      respons = await fetch("/api/flux2Pro/productInEnvironment", {
        method: "POST",
        body: form,
      })
    }

    const data = await respons.json();
    if(data.length > 0){
      setResultDataUrls(data);
      setSelectedVariant(0);
    }
    setBusyGen(false);    
  } 

  /*
   * Fjerner et produkt fra listen over valgte produkter.
   * Frigjør objektURL hvis det er en opplastet fil.
   */

  function removeProduct(id: number) {
    const newArray = selectedProducts.filter(item => item.productId !== id);
    setSelectedProducts(newArray);
  }

  /*
   * Flytter et produkt opp eller ned i listen.
   * Retningen angis med -1 (opp) eller 1 (ned).
   * Validerer grensene slik at produktet ikke flyttes ut av listen.
   */

  function moveProduct(id: number, dir: -1 | 1) {
    setSelectedProducts((prev) => {
      const idx = prev.findIndex((p) => p.productId === id);
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
   * Legger til et produkt basert på ProduktID fra input-feltet.
   * Validerer at:
   * - Input-verdien ikke er tom
   * - Antall valgte produkter ikke overstiger 4
   * - Produktet finnes i databasen via API-kall
   */

  async function addProductId() {
    try{
      setErr("");
      const produktId = productIdInput.trim(); 
      if(!produktId) throw new Error("Skriv produktId");
      if (selectedProducts.length >= 4) throw new Error("Maks 4 produkter");

      // Slå opp produkt via API
      const response =  await fetch(`/api/products/by-id?productId=${encodeURIComponent(produktId)}`);      
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "produkt henting feilet");

      // legg til hentet produkt i produkt array
      setSelectedProducts((prev) =>  [...prev, data])

      // Tømming av inputfelt etter velykket henting av produkt
      setProductIdInput("");
    } catch (e){
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
   * Genererer det endelige bildet med produkter plassert i scenen.
   * Validerer at:
   * - Scene er lastet
   * - 1-4 produkter er valgt
   * - Plasseringsinstruksjon er gitt
   * Sender alle nødvendige data til API for bildegenering.
   */

  /*async function generate() {
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
  }*/

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
            <EnvironmentCard templateId={templateId} setTemplateId={setTemplateId} templates={templates} generateScene={generateScene} 
              darkMode={darkMode} sceneUrl={sceneUrl} busyScene={busyScene} busyGen={busyGen} sceneFixPrompt={sceneFixPrompt} setSceneFixPrompt={setSceneFixPrompt} 
              refineScene={refineScene} selectedModel={selectedModel} setSelectedModel={setSelectedModel}/>
            <h2>
              Velg 1–4 produkter
            </h2>
            <div
              className={`${styles.descriptionText} ${
                darkMode ? styles.dark : styles.light
              }`}
            >
              Skriv inn Produktnummer eller ProduktID
            </div>
            {/* Valg av produkt */}
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
            {/* input av fil */}
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
            {/** Visning av valgte produkter */}
            {selectedProducts.length > 0 && (
              <div
                className={`${styles.productList} ${
                  darkMode ? styles.dark : styles.light
                }`}
              >
                <SelectProductCard selectedProducts={selectedProducts} moveProduct={moveProduct} removeProduct={removeProduct}/>            
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
                onClick={placeProductsInScene}
                disabled={busyGen || busyScene}
                className={`${styles.button} ${styles.flex1} ${styles.flexEnd}`}
              >
                {busyGen ? "Genererer..." : "Generer"}
              </button>
            </div>

            {err && <div className={styles.errorMessage}>{err}</div>}
          </section>
          <ResultsCard darkMode={darkMode} resultDataUrls={resultDataUrls} selectedVariant={selectedVariant} setSelectedVariant={setSelectedVariant}/>          
        </div>
      </main>
    </>
  );
}


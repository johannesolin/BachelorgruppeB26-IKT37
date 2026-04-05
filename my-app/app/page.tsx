"use client";
import { useEffect, useState } from "react";
import { DashboardNav } from "./navigation/DashboardNav";
import styles from "./page.module.css";
import { getStoredTheme, saveTheme } from "../lib/theme";
import { Product } from "@/db/types";
import { templatesArray } from "@/templates/templates";
import { PlacementPreset, Template } from "@/templates/types";
import { EnvironmentCard } from "@/components/EnvironmentCard";
import { ResultsCard } from "@/components/ResultsCard";
import { ProductCard } from "@/components/ProductCard";
import { PlacementCard } from "@/components/PlacementCard";
import { SelectproductByIdCard } from "@/components/SelectProductByIdCard";
import { PLACMENT_PRESET } from "@/templates/templatesPlacmentPreset";

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
  const [selectedModel, setSelectedModel] = useState< "gpt-image-1.5" | "flux-2-pro" | "">("");

  // State for templates og valgt template
  const [templates, setTemplates] = useState<Template[]>(templatesArray as Template[]);
  const [templateId, setTemplateId] = useState<string>(templates[0].id);

  // State for tekst som skal brukes til å generere scenebilde
  const [scenePrompt, setScenePrompt] = useState<string>(templates[0].scenePrompt);

  // State for scenebildet som skal brukes som bakgrunn
  const [sceneUrl, setSceneUrl] = useState<string>("");
  const [sceneTemplate, setSceneTemplate] = useState<Template | null>(null);

  // State for lastetilstander og feilmeldinger
  const [busyScene, setBusyScene] = useState<boolean>(false);
  const [busyGen, setBusyGen] = useState(false);
  const [busyPlacement, setBusyPlacement] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  // State for scenefiksing (scene refinement)
  const [sceneFixPrompt, setSceneFixPrompt] = useState("");

  // State for produktvalg
  const [productIdInput, setProductIdInput] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // State for plasseringsinstruksjoner
  const [placementPrompt, setPlacementPrompt] = useState<string>("");
  const [selectedPlacementPreset, setSelectedPlacementPreset] = useState<string>("");
  const [placementPresets, setPlacementPresets] = useState<PlacementPreset[]>(PLACMENT_PRESET);

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
   * Funksjon for å sende en request for generering av miljøscene basert på templats.
   */

  async function generateScene(){
    setBusyScene(true);
    const temp = templates.find(temp => temp.id === templateId) as Template;
    const form = new FormData();      

    form.append("size", String(temp.size));
    form.append("prompt", String(scenePrompt).trim());    
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

  /*
  * Funksjon for reqwuest for redigering av miljøscene
  */

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

  /*
  * Funksjon for request til å plasere valgte produkter i miljøscene.
  */

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
  * Funksjon for å hente forslag til produkt plasering fra GPT 5.4
  */
  
  async function getPlacementSuggestion(){
    if(!scenePrompt) throw new Error("Velg mal for miljøbilde eller skriv egen tekst!");
    if(selectedModel === "") throw new Error("Velg modell for generering av bilder!");
    if(selectedProducts.length === 0) throw new Error("Legg til minst et produkt!");
    try{
      setBusyPlacement(true);
      const productSummary = buildProductSummary();

      const respons = await fetch("/api/openAi/placementSuggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedModel,
          scenePrompt,
          productSummary,
        }),
      });

      const data = await respons.json();
      if(data.length > 0){
        setPlacementPrompt(data);
      }      
      setBusyPlacement(false);

    } catch (e){
      setBusyPlacement(false);
      console.error(e);
      throw new Error("Henting av plasserings forslag feilet!");
    }
  }

  /*
  * Funksjon for sammensetting av produkt sammendrag
  */

  function buildProductSummary(): string{
    const text: string[] = [];
    selectedProducts.forEach((p, index) => {
      const role = index === 0 ? "1 - HOVEDPRODUKT (skal prioriteres)" : `${index + 1} - sekundær`;
      text.push(`${role}: produktid: ${p.productId}, produktnavn fra database: ${p.name?.trim()}, link til produktbilde: ${p.images[p.selectedImage].href}`)
    });
    return text.join("\n\n");
  }

  /*
  * Funksjon for oppdatering variabel for valgt bilde ved forespørsel til modeller.
  */

  function changeSelectedImage( productIndex: number, imageIndex: number ){
    selectedProducts[productIndex].selectedImage = imageIndex;
  }

  /*
   * Fjerner et produkt fra listen over valgte produkter.
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

  /*function addUploads(files: FileList | null) {
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
            <EnvironmentCard templateId={templateId} scenePrompt={scenePrompt} setScenePrompt={setScenePrompt} setTemplateId={setTemplateId} templates={templates} generateScene={generateScene} 
              darkMode={darkMode} sceneUrl={sceneUrl} busyGen={busyGen} busyScene={busyScene} busyPlacement={busyPlacement} sceneFixPrompt={sceneFixPrompt} setSceneFixPrompt={setSceneFixPrompt} 
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
            <SelectproductByIdCard productIdInput={productIdInput} setProductIdInput={setProductIdInput} darkMode={darkMode} addProductId={addProductId} selectedProducts={selectedProducts}/>
            {/* input av fil */}            
            {/** Visning av valgte produkter */}
            {selectedProducts.length > 0 && (
              <div
                className={`${styles.productList} ${
                  darkMode ? styles.dark : styles.light
                }`}
              >
                {selectedProducts?.map((product, index) => (
                  <ProductCard key={product.productId} product={product} moveProduct={moveProduct} removeProduct={removeProduct} index={index} selectedProducts={selectedProducts} changeSelectedImage={changeSelectedImage}/>
                ))}                     
              </div>
            )}
            {/* Plassering av produkter i miljøbilde */}
            <PlacementCard getPlacementSuggestion={getPlacementSuggestion} selectedPlacementPreset={selectedPlacementPreset} setSelectedPlacementPreset={setSelectedPlacementPreset} placementPresets={placementPresets} placementPrompt={placementPrompt} setPlacementPrompt={setPlacementPrompt} darkMode={darkMode} variants={variants} setVariants={setVariants} placeProductsInScene={placeProductsInScene} busyGen={busyGen} busyPlacement={busyPlacement} busyScene={busyScene}/>      
            {err && <div className={styles.errorMessage}>{err}</div>}
          </section>
          <ResultsCard darkMode={darkMode} resultDataUrls={resultDataUrls} selectedVariant={selectedVariant} setSelectedVariant={setSelectedVariant}/>          
        </div>
      </main>
    </>
  );
}


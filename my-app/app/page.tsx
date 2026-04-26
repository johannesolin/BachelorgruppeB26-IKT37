"use client";
import { useEffect, useState } from "react";
import { DashboardNav } from "./navigation/DashboardNav";
import styles from "./page.module.css";
import { getStoredTheme, saveTheme } from "../lib/theme";
import { Product } from "@/db/types";
import { templatesArray } from "@/templates/templates";
import { Template } from "@/templates/types";
import { EnvironmentCard } from "@/components/EnvironmentCard";
import { ResultsCard } from "@/components/ResultsCard";
import { ProductCard } from "@/components/ProductCard";
import { PlacementCard } from "@/components/PlacementCard";
import { SelectproductByIdCard } from "@/components/SelectProductByIdCard";
import { EditResultCard } from "@/components/EditResultCard";

/*
 * Hovedkomponent for dashbordet.
 * Håndterer alle aspekter av miljøbilde- og produktplasseringsflyten,
 * inkludert template-valg, scenemanipulasjon, produktvalg og generering av endelige bilder.
 */


export default function Page() {
  // State for modell valg
  const [selectedModel, setSelectedModel] = useState<"gpt-image-1.5" | "flux-2-pro" | "">("");

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
  const [busyDatabase, setBusyDatabase] = useState<boolean>(false);
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

  // State for redigering slutt bilde
  const [editResultPrompt, setEditResultPrompt] = useState<string>("");

  // State for variabler til lagring av prompts
  const [resultProductNames, setResultProductNames] = useState<Array<string>>([]);
  const [resultProductIds, setResultProductIds] = useState<Array<number>>([]);
  const [resultModel, setResultModel] = useState<"gpt-image-1.5" | "flux-2-pro" | "">("");
  const [resultEnvironmentPrompt, setResultEnvironmentPrompt] = useState<string>("");
  const [resultEditEnvironmentPrompts, setResultEditEnvironmentPrompts] = useState<Array<string>>([]);
  const [resultImagePrompt, setResultImagePrompt] = useState<string>("");
  const [resultEditImagePrompts, setResultEditImagePrompts] = useState<Array<string>>([]);

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
   * Funksjon for hard refresh av applikasjonen.
   */

  function reset(){    
    window.location.reload();
  }

  /*
   * Funksjon for å sende en request for generering av miljøscene basert på templats.
   */

  async function generateScene(){
    try{      
      setBusyScene(true);
      setErr("");
      setEditResultPrompt("");
      setSceneFixPrompt("");
      setResultEnvironmentPrompt("");
      setResultEditEnvironmentPrompts([]);

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
      } else if (selectedModel === "flux-2-pro") {
        respons = await fetch("/api/flux2Pro/generateEnvironment", {
          method: "POST",
          body: form,
        });
      } else {
        setBusyScene(false);
        setErr("Velg modell for generering av av miljøbilde")
        throw new Error("Et problem oppsto ved generering av miljøbilde");
      }

      const data = await respons.json();
      if(data){    
        setSceneUrl(data);
        setSceneTemplate(temp);
        setResultEnvironmentPrompt(scenePrompt);      
      }
      setBusyScene(false);
    } catch (e){
      setBusyScene(false);
      console.error(e);
      setErr("Et problem oppsto ved generering av miljøbilde");
      throw new Error("Et problem oppsto ved generering av miljøbilde");
    }
  }

  /*
  * Funksjon for reqwuest for redigering av miljøscene
  */

  async function refineScene() {
    try{
      setErr("");
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
      } else if (selectedModel === "flux-2-pro") {
        respons = await fetch("/api/flux2Pro/editEnvironment", {
          method: "POST",
          body: form,
        });
      } else {
        setBusyScene(false);
        setErr("Velg modell for generering av av miljøbilde")
        throw new Error("Et problem oppsto ved generering av miljøbilde");
      }

      const data = await respons.json();
      if(data.length > 0){
        setSceneUrl(data);
        setResultEditEnvironmentPrompts((prev) => [...prev, sceneFixPrompt]);
      }
      setBusyScene(false);
    } catch (e){
      setBusyScene(false);
      console.error(e);
      setErr("Et problem oppsto ved generering av miljøbilde");
      throw new Error("Et problem oppsto ved generering av miljøbilde");
    }
  }

  /*
  * Funksjon for request til å plasere valgte produkter i miljøscene.
  */

  async function placeProductsInScene() {
    try{
      setErr("");
      setBusyGen(true);
      setResultDataUrls([]);
      setResultModel("");
      setResultProductIds([]);
      setResultProductNames([]);
      setResultImagePrompt("");
      setResultEditImagePrompts([]);

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
      } else if (selectedModel === "flux-2-pro") {
        respons = await fetch("/api/flux2Pro/productInEnvironment", {
          method: "POST",
          body: form,
        })
      } else {
        setBusyGen(false);
        setErr("Velg modell for generering av av miljøbilde")
        throw new Error("Et problem oppsto ved generering av miljøbilde");
      }

      const data = await respons.json();
      if(data.length > 0){
        setResultDataUrls(data);
        setSelectedVariant(0);
        setResultModel(selectedModel);
        const ids: Array<number> = [];
        const names: Array<string> = [];
        selectedProducts.forEach(product => {ids.push(product.productId); names.push(product.name);});
        setResultProductIds(ids);
        setResultProductNames(names);
        setResultImagePrompt(placementPrompt);
      }
      setBusyGen(false);
    } catch (e){
      setBusyGen(false);
      console.error(e);
      setErr("Et problem oppsto ved generering av bilde");
      throw new Error("Et problem oppsto ved generering av bilde");
    }
  }
  /*
  * Funksjon for sending av request for forslag til produkt plasering fra GPT 5.4.
  */
  
  async function getPlacementSuggestion(){     
    try{
      setErr("");
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
      setErr("Henting av plasserings forslag feilet!");
      throw new Error("Henting av plasserings forslag feilet!");
    }
  }

  /*
  * Funksjon for redigering av slutt bilde
  */

  async function editFinalImage(){
    try{setErr("");
      setBusyGen(true);      

      const scene = resultDataUrls[selectedVariant];
      const body = JSON.stringify({
          scene,
          editResultPrompt,
      });

      let respons;
      if(selectedModel === "gpt-image-1.5"){
        respons = await fetch("/api/openAi/editFinalImage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
      } else if (selectedModel === "flux-2-pro") {
        respons = await fetch("/api/flux2Pro/editFinalImage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
      } else {
        setBusyGen(false);
        setErr("Velg modell for generering av av miljøbilde");
        throw new Error("Et problem oppsto ved generering av miljøbilde");
      }

      const data = await respons.json();
      if(data.length > 0){
        setResultDataUrls([data]);
        setSelectedVariant(0);
        setResultEditImagePrompts((prev) => [...prev, editResultPrompt]);
      }

      setBusyGen(false);  
    } catch (e){
      setBusyGen(false);
      console.error(e);
      setErr("Et problem oppsto ved generering av miljøbilde");
      throw new Error("Et problem oppsto ved generering av miljøbilde");
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
  * Funksjon for oppdatering av variabel for valgt bilde for produkter.
  */

  function changeSelectedImage( productIndex: number, imageIndex: number ){
    selectedProducts[productIndex].selectedImage = imageIndex;
  }

  /*
   * Fjerner et produkt fra listen over valgte produkter.
   */

  function removeProduct(id: number) {
    try{
      setErr("");
      const newArray = selectedProducts.filter(item => item.productId !== id);
      setSelectedProducts(newArray);
    } catch (e){
      console.error(e);
      setErr("En feil oppsto ved fjering av produkt");
      throw new Error("En feil oppsto ved fjering av produkt");
    }
  }

  /*
   * Flytter et produkt opp eller ned i listen.
   * Retningen angis med -1 (opp) eller 1 (ned).
   * Validerer grensene slik at produktet ikke flyttes ut av listen.
   */

  function moveProduct(id: number, dir: -1 | 1) {
    try{
      setErr("");
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
    } catch (e){
      console.error(e);
      setErr("En feil oppsto ved flytting av produktet");
      throw new Error("En feil oppsto ved flytting av produktet");
    }
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
      setBusyDatabase(true);
      const produktId = productIdInput.trim(); 
      if(!produktId) throw new Error("Skriv produktId");
      if (selectedProducts.length >= 4) throw new Error("Maks 4 produkter");

      const body = JSON.stringify({
        id: produktId,
      });
      // Slå opp produkt via API
      const response = await fetch("/api/products/by-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      })
      
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "produkt henting feilet");

      setSelectedProducts((prev) =>  [...prev, data])
      setBusyDatabase(false);
      setProductIdInput("");
    } catch (e){
      console.error(e);
      setBusyDatabase(false);
      setErr("En feil oppsto når produktet skulle legges til");
      throw new Error("En feil oppsto når produktet skulle legges til");
    }  
  }

  /*
  * Funksjon for å lagre resultater i promt database  
  */

  async function storeResults() {
    try{
      setErr("");
      setBusyDatabase(true);

      const body = JSON.stringify({
          productName: resultProductNames,
          productId:  resultProductIds,
          image: resultDataUrls[selectedVariant],
          model: resultModel,
          miljoPrompt: resultEnvironmentPrompt,
          miljoEditPrompt: resultEditEnvironmentPrompts,
          imagePrompt: resultImagePrompt,
          imageEditPrompt: resultEditImagePrompts,
      })
      
      console.log(body);
      
      /*const response = await fetch("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = await response.json();

      if(!response.ok) throw new Error(data.error || "Lagring av resultater feilet");*/     


      setBusyDatabase(false);

    } catch (e) {
      setBusyDatabase(false);
      console.error(e);
      setErr("En feil oppstod ved lagring av resultater");
      throw new Error("En feil oppstod ved lagring av resultater");
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
              Skriv inn Produkt ID
            </div>
            {/* Valg av produkt */}
            <SelectproductByIdCard productIdInput={productIdInput} setProductIdInput={setProductIdInput} darkMode={darkMode} addProductId={addProductId} selectedProducts={selectedProducts} busyDatabase={busyDatabase}/>
            {/* input av fil */}            
            {/** Visning av valgte produkter */}
            {selectedProducts.length > 0 && (
              <div
                className={`${styles.productList} ${styles.productGrid} ${
                  darkMode ? styles.dark : styles.light
                }`}
              >
                {selectedProducts?.map((product, index) => (
                  <ProductCard darkMode={darkMode} key={product.productId} product={product} moveProduct={moveProduct} removeProduct={removeProduct} index={index} selectedProducts={selectedProducts} changeSelectedImage={changeSelectedImage}/>
                ))}                     
              </div>
            )}
            {/* Plassering av produkter i miljøbilde */}
            <PlacementCard selectedProducts={selectedProducts} selectedModel={selectedModel} scenePrompt={scenePrompt} getPlacementSuggestion={getPlacementSuggestion} placementPrompt={placementPrompt} setPlacementPrompt={setPlacementPrompt} darkMode={darkMode} variants={variants} setVariants={setVariants} placeProductsInScene={placeProductsInScene} busyGen={busyGen} busyPlacement={busyPlacement} busyScene={busyScene}/>      
            {err && <div className={styles.errorMessage}>{err}</div>}
          </section>
          <section
            className={`${styles.configSection} ${
              darkMode ? styles.dark : styles.light
            }`}
          >
            <ResultsCard darkMode={darkMode} resultDataUrls={resultDataUrls} selectedVariant={selectedVariant} setSelectedVariant={setSelectedVariant}/>
            <EditResultCard editResultPrompt={editResultPrompt} setEditResultPrompt={setEditResultPrompt} darkMode={darkMode} resultDataUrls={resultDataUrls} busyGen={busyGen} busyPlacement={busyPlacement} busyScene={busyScene} selectedModel={selectedModel} editFinalImage={editFinalImage}/>
            {resultDataUrls.length != 0 && <button onClick={storeResults}>Lagre Resultat</button>}
            <button onClick={reset}>Tøm alle input og resultater</button>        
          </section>
          
        </div>
      </main>
    </>
  );
}


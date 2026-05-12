"use client";
import { useEffect, useState } from "react";
import { DashboardNav } from "./navigation/DashboardNav";
import styles from "./page.module.css";
import { getStoredTheme, saveTheme } from "../lib/theme";
import { ListProduct, Product } from "@/db/types";
import { templatesArray } from "@/templates/templates";
import { Template } from "@/templates/types";
import { EnvironmentCard } from "@/components/EnvironmentCard";
import { ResultsCard } from "@/components/ResultsCard";
import { ProductCard } from "@/components/ProductCard";
import { PlacementCard } from "@/components/PlacementCard";
import { SelectproductByIdCard } from "@/components/SelectProductByIdCard";
import { EditResultCard } from "@/components/EditResultCard";
import { LoadingModal } from "@/components/LoadingModal";
import { StoringModal } from "@/components/StoringModal";
import { ProductSearchModal } from "@/components/ProductSearchModal";

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
  const [busyGen, setBusyGen] = useState<boolean>(false);
  const [busyDatabase, setBusyDatabase] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  // State for scenefiksing (scene refinement)
  const [sceneFixPrompt, setSceneFixPrompt] = useState("");

  // State for produkt valg variabler
  const [productIdInput, setProductIdInput] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // State variabler for kategori produktsøk
  const [productCategoryList, setProductCategoryList] = useState<Product[] | []>([]);

  // State for plasseringsinstruksjoner
  const [placementPrompt, setPlacementPrompt] = useState<string>("");

  // State for estimert generatortid (sendes til LoadingModal)
  const [estimatedSeconds, setEstimatedSeconds] = useState<number>(20);

  // State for generering av resultater
  const [variants, setVariants] = useState<number>(1);
  const [resultDataUrls, setResultDataUrls] = useState<string[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number>(0);

  // State for redigering slutt bilde
  const [editResultPrompt, setEditResultPrompt] = useState<string>("");

  // State for variabler til lagring av miljøbilde resultater
  const [resultEnvironmentPrompt, setResultEnvironmentPrompt] = useState<string>("");
  const [enviromentCategory, setEnviromentCategory] = useState<"Uteplass/terasse" | "Uteplass/gressplen" | "Stue" | "">("");
  const [resultEnviromentModel, setResultEnviromentModel] = useState<string>("");

  // State for lagringa av produkt plassering resulter
  const [resultProductNames, setResultProductNames] = useState<Array<string>>([]);
  const [resultProductIds, setResultProductIds] = useState<Array<number>>([]);
  const [resultModel, setResultModel] = useState<"gpt-image-1.5" | "flux-2-pro" | "">("");  
  const [resultImagePrompt, setResultImagePrompt] = useState<string>("");

  // State for bekreftelse av DB lagring
  const [storageMessage, setStorageMessage] = useState<string>("");

  // State for lagring av prompt bekreftelse
  const [promptSaveMessage, setPromptSaveMessage] = useState<string>("");

  // State for åpning av produkt søk modal
  const [searchModalState, setSearchModalState] = useState<boolean>(false);

  // State for mørkt/lyst tema
  const [darkMode, setDarkModeState] = useState<boolean>(true);

  /*
   * Laster lagret tema fra localStorage ved komponentens montering.
   */

  useEffect(() => {
    const storedTheme = getStoredTheme();
    setDarkModeState(storedTheme === "dark");

    // Gjenopprett input-felt fra forrige økt
    const savedScene = localStorage.getItem("app-scene-prompt");
    const savedPlacement = localStorage.getItem("app-placement-prompt");
    const savedModel = localStorage.getItem("app-selected-model") as "gpt-image-1.5" | "flux-2-pro" | "";
    if (savedScene !== null) setScenePrompt(savedScene);
    if (savedPlacement !== null) setPlacementPrompt(savedPlacement);
    if (savedModel) setSelectedModel(savedModel);
  }, []);

  // Lagre input-felt til localStorage når de endres
  useEffect(() => { localStorage.setItem("app-scene-prompt", scenePrompt); }, [scenePrompt]);
  useEffect(() => { localStorage.setItem("app-placement-prompt", placementPrompt); }, [placementPrompt]);
  useEffect(() => { localStorage.setItem("app-selected-model", selectedModel); }, [selectedModel]);

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
   * Tømmer alle input-felt, resultater og valgte produkter.
   * Fjerner også lagrede input-felt fra localStorage.
   */

  function reset() {
    localStorage.removeItem("app-scene-prompt");
    localStorage.removeItem("app-placement-prompt");
    localStorage.removeItem("app-selected-model");

    setSelectedModel("");
    setTemplateId(templates[0].id);
    setScenePrompt(templates[0].scenePrompt);
    setSceneUrl("");
    setSceneTemplate(null);
    setErr("");
    setSceneFixPrompt("");
    setProductIdInput("");
    setSelectedProducts([]);
    setProductCategoryList([]);
    setPlacementPrompt("");
    setVariants(1);
    setResultDataUrls([]);
    setSelectedVariant(0);
    setEditResultPrompt("");
    setResultEnvironmentPrompt("");
    setEnviromentCategory("");
    setResultEnviromentModel("");
    setResultProductNames([]);
    setResultProductIds([]);
    setResultModel("");
    setResultImagePrompt("");
    setStorageMessage("");
    setPromptSaveMessage("");
  }

  function getEstimate(model: string, variantCount = 1): number {
    const base = model === "gpt-image-1.5" ? 25 : model === "flux-2-pro" ? 15 : 20;
    const extra = model === "gpt-image-1.5" ? 12 : 7;
    return base + (variantCount - 1) * extra;
  }

  /*
   * Funksjon for å sende en request for generering av miljøscene basert på templats.
   */

  async function generateScene(){
    try{
      setEstimatedSeconds(getEstimate(selectedModel));
      setBusyGen(true);
      setErr("");
      setEditResultPrompt("");
      setSceneFixPrompt("");
      setResultEnvironmentPrompt("");
      setResultEnviromentModel("");

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
        setBusyGen(false);
        setErr("Velg modell for generering av av miljøbilde")
        throw new Error("Et problem oppsto ved generering av miljøbilde");
      }

      const data = await respons.json();
      if(data){    
        setSceneUrl(data);
        setSceneTemplate(temp);
        setResultEnvironmentPrompt(scenePrompt);
        setResultEnviromentModel(selectedModel);      
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
  * Funksjon for reqwuest for redigering av miljøscene
  */

  async function refineScene() {
    try{
      setEstimatedSeconds(getEstimate(selectedModel));
      setStorageMessage("");
      setErr("");
      setBusyGen(true);
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
        setBusyGen(false);
        setErr("Velg modell for generering av av miljøbilde")
        throw new Error("Et problem oppsto ved generering av miljøbilde");
      }

      const data = await respons.json();
      if(data.length > 0){
        setSceneUrl(data);
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
  * Funksjon for request til å plasere valgte produkter i miljøscene.
  */

  async function placeProductsInScene() {
    try{
      setEstimatedSeconds(getEstimate(selectedModel, variants));
      setErr("");
      setBusyGen(true);
      setResultDataUrls([]);
      setResultModel("");
      setResultProductIds([]);
      setResultProductNames([]);
      setResultImagePrompt("");

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
      setErr("Et problem oppsto ved generering av bilde");
      throw new Error("Et problem oppsto ved generering av bilde" + e);
    }
  }
  /*
  * Funksjon for sending av request for forslag til produkt plasering fra GPT 5.4.
  */
  
  async function getPlacementSuggestion(){     
    try{
      setErr("");
      setBusyGen(true);
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
      setBusyGen(false);

    } catch (e){
      setBusyGen(false);
      setErr("Henting av plasserings forslag feilet!");
      throw new Error("Henting av plasserings forslag feilet!" + e);
    }
  }

  /*
  * Funksjon for redigering av slutt bilde
  */

  async function editFinalImage(){
    try{
      setEstimatedSeconds(getEstimate(selectedModel));
      setErr("");
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
      }

      setBusyGen(false);  
    } catch (e){
      setBusyGen(false);
      setErr("Et problem oppsto ved generering av miljøbilde");
      throw new Error("Et problem oppsto ved generering av miljøbilde" +e );
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
      setStorageMessage("");
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
      setStorageMessage("");
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
      setStorageMessage("");
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

  function addProductFromCategorySearch( product: ListProduct ){
    setErr("");
    if(selectedProducts.length >= 4){
      setErr("For mange produkter valgt");
      throw new Error("For mange produkter valgt");
    }
    const temp = product as Product;
    temp.selectedImage = 0;
    setSelectedProducts((prev) =>  [...prev, temp]);
  }

  /*
  * Funksjon for å produkt søk på produkt kategori.
  */

  async function productCategoriSearch( area: string | undefined, category: string | undefined, assortment: string | undefined) {
    try{
      setErr("");
      setBusyDatabase(true);
      setProductCategoryList([]);

      if(!(area || category || assortment)) throw new Error("Mangler valg a minst en kategori ved produktsøk");

      const body = JSON.stringify({
        area,
        category,
        assortment,
      })

      const response = await fetch("/api/products/productByCategory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      })

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "produkt henting feilet");

      setProductCategoryList(data);
      setBusyDatabase(false);
    } catch (e){
      console.error(e);
      setBusyDatabase(false);
      setErr("En feil oppsto ved produktsøk");
      throw new Error("En feil oppsto ved produktsøk");
    }
  }

  /*
  * Funksjon for å lagre miljøbilde resultat
  */

  async function storeEnviromentResult() {
    try{
      setErr("");
      setBusyDatabase(true);

      if(enviromentCategory === ""){
        setErr("Velg kategori før lagering av miljøbilde!");
        throw new Error("Velg kategori før lagering av miljøbilde!");
      }

      if(resultEnvironmentPrompt === "" || sceneUrl === "" || resultEnviromentModel === ""){
        setErr("Mangler data for lagering av resultat.");
        throw new Error("Mangler data for lagering av resultat.");
      } 

      const body = JSON.stringify({
        imageString: sceneUrl,
        prompt: resultEnvironmentPrompt,
        category: enviromentCategory,
        model: resultEnviromentModel,
      });

      const response = await fetch("/api/promptDb/post-env-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const result = await response.json();

      if(!result) throw new Error("Lagring av resultater feilet " + result.error);

      setResultEnvironmentPrompt("");
      setResultEnviromentModel("");
      setBusyDatabase(false);
    }catch (e){
      setBusyDatabase(false);
      setErr("Feil ved larging av Miljøbilde!");
      throw new Error(`Error with storing of enviroment results ${e}`);
    }    
  }

  /*
  * Funksjon for å lagre en prompt separat i databasen
  */

  async function storePrompt(prompt: string, promptType: "scene" | "placement") {
    try {
      setErr("");
      setBusyDatabase(true);

      const body = JSON.stringify({
        prompt: prompt.trim(),
        model: selectedModel,
        promptType,
      });

      const response = await fetch("/api/promptDb/save-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const result = await response.json();
      if (!result.success) throw new Error("Lagring av prompt feilet");

      setPromptSaveMessage("Prompt lagret!");
      setTimeout(() => setPromptSaveMessage(""), 3000);
      setBusyDatabase(false);
    } catch (e) {
      setBusyDatabase(false);
      setErr("Feil ved lagring av prompt");
      throw new Error("Feil ved lagring av prompt " + e);
    }
  }

  /*
  * Funksjon for å lagre resultater i promt database
  */

  async function storeResults() {
    try{
      setErr("");
      setBusyDatabase(true);
       
      if(resultDataUrls.length === 0 || resultProductNames.length === 0 || resultProductIds.length === 0 || resultModel === "" || resultImagePrompt === ""){
        setErr("Mangler data for lagering av resultat.");
        throw new Error("Mangler data for lagering av resultat.");
      } 

      const body = JSON.stringify({
          productNames: resultProductNames,
          productIds:  resultProductIds,
          image: resultDataUrls[selectedVariant],
          model: resultModel,
          prompt: resultImagePrompt,
      });
      
      const response = await fetch("/api/promptDb/post-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      
      const result = await response.json();

      if(!result) throw new Error("Lagring av resultater feilet" + result.error);

      setResultImagePrompt("");
      setResultModel("");
      setResultProductIds([]);
      setResultProductNames([]);
      setBusyDatabase(false);
    } catch (e) {
      setBusyDatabase(false);
      setErr("En feil oppstod ved lagring av resultater");
      throw new Error("En feil oppstod ved lagring av resultater " + e);
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
              darkMode={darkMode} sceneUrl={sceneUrl} busyGen={busyGen} sceneFixPrompt={sceneFixPrompt} setSceneFixPrompt={setSceneFixPrompt} 
              refineScene={refineScene} selectedModel={selectedModel} setSelectedModel={setSelectedModel} busyDatabase={busyDatabase} storeEnviromentResult={storeEnviromentResult}
              enviromentCategory={enviromentCategory} setEnviromentCategory={setEnviromentCategory}/>
            <h2 className={`${styles.heading2} ${darkMode ? styles.dark : styles.light}`}>
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
            <SelectproductByIdCard setSearchModalState={setSearchModalState} productIdInput={productIdInput} setProductIdInput={setProductIdInput} darkMode={darkMode} addProductId={addProductId} selectedProducts={selectedProducts} busyDatabase={busyDatabase}/>
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
            <PlacementCard selectedProducts={selectedProducts} selectedModel={selectedModel} scenePrompt={scenePrompt} getPlacementSuggestion={getPlacementSuggestion} placementPrompt={placementPrompt} setPlacementPrompt={setPlacementPrompt} darkMode={darkMode} variants={variants} setVariants={setVariants} placeProductsInScene={placeProductsInScene} busyGen={busyGen}/>      
            {err && <div className={styles.errorMessage}>{err}</div>}
          </section>
          <section
            className={`${styles.configSection} ${
              darkMode ? styles.dark : styles.light
            }`}
          >
            <ResultsCard darkMode={darkMode} resultDataUrls={resultDataUrls} selectedVariant={selectedVariant} setSelectedVariant={setSelectedVariant}/>
            <EditResultCard editResultPrompt={editResultPrompt} setEditResultPrompt={setEditResultPrompt} darkMode={darkMode} resultDataUrls={resultDataUrls} busyGen={busyGen} selectedModel={selectedModel} editFinalImage={editFinalImage}/>
            {resultDataUrls.length != 0 && <button onClick={storeResults} disabled={busyDatabase || resultImagePrompt === ""}>Lagre Resultat</button>}
            {storageMessage != "" && <h3 className={`${styles.heading3} ${darkMode ? styles.dark : styles.light}`}>{storageMessage}</h3>}
            <h2 className={`${styles.heading2} ${darkMode ? styles.dark : styles.light}`}>Lagre Prompt</h2>
            <button
              type="button"
              onClick={() => storePrompt(scenePrompt, "scene")}
              disabled={busyDatabase || !scenePrompt.trim()}
            >
              Lagre Scene-Prompt
            </button>
            <button
              type="button"
              onClick={() => storePrompt(placementPrompt, "placement")}
              disabled={busyDatabase || !placementPrompt.trim()}
            >
              Lagre Plasseringspromt
            </button>
            {promptSaveMessage !== "" && <h3 className={`${styles.heading3} ${darkMode ? styles.dark : styles.light}`}>{promptSaveMessage}</h3>}
          </section>                 
        </div>
        <button type="button" onClick={reset} className={styles.resetButton}>
          Tøm alt
        </button>
        <ProductSearchModal addProductFromCategorySearch={addProductFromCategorySearch} selectedProducts={selectedProducts} darkMode={darkMode} searchModalState={searchModalState} setSeachModalState={setSearchModalState} productCategoriSearch={productCategoriSearch} productCategoryList={productCategoryList}/>
        <LoadingModal busyGen={busyGen} darkMode={darkMode} selectedModel={selectedModel} estimatedSeconds={estimatedSeconds}/>
        <StoringModal busyDatabase={busyDatabase} darkMode={darkMode}/>     
      </main>
    </>
  );
}


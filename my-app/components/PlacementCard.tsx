import { PlacementPreset } from "@/templates/types";
import styles from "../app/page.module.css";
import { PlacementCardProps } from "./types";

export function PlacementCard( props: PlacementCardProps ){
  function changePlacementPreset( id: string ){
     const temp = props.placementPresets.find(temp => temp.id === id) as PlacementPreset;
     props.setSelectedPlacementPreset(id);
     props.setPlacementPrompt(id === "" ? "" : temp.text);    
  }
    return (
        <>
        <h2
              className={`${styles.heading2Large} ${styles.heading2} ${
                props.darkMode ? styles.dark : styles.light
              }`}
            >
              ØNSKET PLASSERING PÅ PRODUKT(ENE)
            </h2>
            <p>Velg evt. preset, rediger tekst, eller hent forslag automatisk.</p>
            <select value={props.selectedPlacementPreset} onChange={e => changePlacementPreset(e.target.value)}>
              <option value="">- Velg mal -</option>
              {props.placementPresets?.map((placement) => (
                <option key={placement.id} value={placement.id}>{placement.label}</option>
              ))}
            </select>
            <textarea
              value={props.placementPrompt}
              onChange={(e) => props.setPlacementPrompt(e.target.value)}
              rows={6}
              placeholder="Eks: Plasser produktet i sentrum av bordet. Orienter det mot venstre. Produktet skal være lettsynlig og dominere komposisjonen."
              className={`${styles.textarea} ${props.darkMode ? styles.dark : styles.light}`}
            />
            <button onClick={props.getPlacementSuggestion} disabled={props.busyGen || props.selectedProducts.length === 0 || props.selectedModel === "" || props.scenePrompt === "" || props.busyScene || props.busyPlacement}>{props.busyPlacement ? "Henter forslag fra språkmodell..." : "Få forslag fra språkmodell (GPT 5.4)"}</button>
            <div className={styles.variantsContainer}>
              <label className={styles.flex1}>
                <div className={styles.variantsLabel}>Varianter</div>
                <select
                  value={props.variants}
                  onChange={(e) => props.setVariants(Number(e.target.value))}
                  className={`${styles.select} ${props.darkMode ? styles.dark : styles.light}`}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                </select>
              </label>
              <button
                onClick={props.placeProductsInScene}
                disabled={props.busyGen || props.busyScene || props.busyPlacement || props.placementPrompt.length === 0}
                className={`${styles.button} ${styles.flex1} ${styles.flexEnd}`}
              >
                {props.busyGen ? "Genererer..." : "Generer"}
              </button>
            </div>
        </>
    );
}
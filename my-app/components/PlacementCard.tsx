import styles from "../app/page.module.css";
import { PlacementCardProps } from "./types";

export function PlacementCard( props: PlacementCardProps ){
  const baseTime = props.selectedModel === "gpt-image-1.5" ? 25 : 15;
  const extraPerVariant = props.selectedModel === "gpt-image-1.5" ? 12 : 7;
  const estimatedTime = baseTime + (props.variants - 1) * extraPerVariant;

  return (
        <>
          <h2 className={`${styles.heading2Large} ${styles.heading2} ${props.darkMode ? styles.dark : styles.light}`}>
            ØNSKET PLASSERING PÅ PRODUKT(ENE)
          </h2>
          <p>Skriv inn tekst for plassering av produkt(ene) i miljøbilde, eller hent forslag automatisk.</p>
          <textarea
            value={props.placementPrompt}
            onChange={(e) => props.setPlacementPrompt(e.target.value)}
            rows={6}
            placeholder="Eks: Plasser produktet i sentrum av bordet. Orienter det mot venstre. Produktet skal være lettsynlig og dominere komposisjonen."
            className={`${styles.textarea} ${props.darkMode ? styles.dark : styles.light}`}
          />
          <button onClick={props.getPlacementSuggestion} disabled={props.busyGen || props.selectedProducts.length === 0 || props.selectedModel === "" || props.scenePrompt === ""}>Få forslag fra språkmodell (GPT 5.4)</button>
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
              disabled={props.busyGen || props.placementPrompt.length === 0}
              className={`${styles.button} ${styles.flex1} ${styles.flexEnd}`}
            >
              {props.busyGen ? "Genererer..." : "Generer"}
            </button>
          </div>
          {props.selectedModel !== "" && (
            <div className={styles.timeEstimate}>
              Estimert tid: ca. {estimatedTime} sek for {props.variants} variant{props.variants > 1 ? "er" : ""}
            </div>
          )}
        </>
    );
}
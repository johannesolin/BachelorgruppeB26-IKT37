import { SelectProductByIdCardProps } from "./types";
import styles from "../app/page.module.css";

export function SelectproductByIdCard( props: SelectProductByIdCardProps ){
    return (
        <>
            <div className={styles.flexContainer}>
              <input
                value={props.productIdInput}
                onChange={(e) => props.setProductIdInput(e.target.value)}
                placeholder="Produktnummer Her..."
                className={`${styles.input} ${styles.flex1} ${
                  props.darkMode ? styles.dark : styles.light
                }`}
              />
              <button
                onClick={props.addProductId}
                disabled={props.selectedProducts.length >= 4 || props.productIdInput.length === 0 || props.busyDatabase}
              >
                Legg til
              </button>
              <button onClick={() => props.setSearchModalState(true)}>Søk etter kategori</button>
            </div>
        </>
    );
}
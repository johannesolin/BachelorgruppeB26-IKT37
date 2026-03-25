import { Product } from "@/db/types";
import styles from "../app/page.module.css";
import { SelectProductCardProps } from "@/components/types";

export const SelectProductCard = (props : SelectProductCardProps) => {
    return (
        <>
        {props.selectedProducts.map((p : Product, index : number) => (
                    <div key={p.productId} className={styles.productCard}>
                      <div className={styles.productCardHeader}>
                        <div className={styles.productCardLabel}>
                          {`${p.productId}${p.name ? ` – ${p.name}` : ""}`}
                        </div>
                        <div className={styles.productCardButtonGroup}>
                          <button
                            onClick={() => props.moveProduct(p.productId, -1)}
                            disabled={index === 0}
                            title="Flytt opp"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => props.moveProduct(p.productId, 1)}
                            disabled={index === props.selectedProducts.length - 1}
                            title="Flytt ned"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => props.removeProduct(p.productId)}
                            title="Fjern"
                          >
                            X
                          </button>
                        </div>
                      </div>                      
                        <img
                          src={p.images[0].href}
                          alt="produkt bilde"
                          className={styles.productImage}
                        />
                    </div>
                  ))}
    </>
    );
}
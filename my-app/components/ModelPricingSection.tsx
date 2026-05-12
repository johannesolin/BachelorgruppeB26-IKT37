import styles from "../app/profil/page.module.css";
import { ModelPricingSectionProps } from "./types";

export function ModelPricingSection(props: ModelPricingSectionProps) {
    return (
        <div className={styles.pricingSection}>
            <div className={styles.pricingHeader}>
                <span className={styles.pricingTitle}>Pris per generering</span>
                <span className={`${styles.pricingDate} ${props.dark ? styles.pricingDateDark : styles.pricingDateLight}`}>
                    Hentet 12.05.2026
                </span>
            </div>
            <div className={styles.pricingRows}>
                {props.rows.map((r) => (
                    <div
                        key={r.label}
                        className={`${styles.pricingRow} ${props.dark ? styles.pricingRowDark : styles.pricingRowLight}`}
                    >
                        <span className={styles.pricingLabel}>{r.label}</span>
                        <span className={styles.pricingValue}>{r.price}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

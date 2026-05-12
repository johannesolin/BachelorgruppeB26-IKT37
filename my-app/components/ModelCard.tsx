import styles from "../app/profil/page.module.css";
import { ModelCardProps } from "./types";
import { ModelPropertyRow } from "./ModelPropertyRow";
import { ModelPricingSection } from "./ModelPricingSection";

export function ModelCard(props: ModelCardProps) {
    const badgeClass = props.badgeVariant === "blue" ? styles.badgeBlue : styles.badgePurple;
    return (
        <div className={`${styles.modelCard} ${props.dark ? styles.modelCardDark : styles.modelCardLight}`}>
            <div className={styles.modelHeader}>
                <div className={styles.modelTitleRow}>
                    <span className={styles.modelIcon}>{props.icon}</span>
                    <h3 className={styles.modelName}>{props.name}</h3>
                    <span className={`${styles.modelBadge} ${badgeClass}`}>{props.provider}</span>
                </div>
                <p className={styles.modelDescription}>{props.description}</p>
            </div>
            <div className={styles.propertiesList}>
                <h4 className={styles.propertiesTitle}>Egenskaper</h4>
                <div className={styles.propertyGrid}>
                    {props.properties.map((p) => (
                        <ModelPropertyRow key={p.label} icon={p.icon} label={p.label} value={p.value} dark={props.dark} />
                    ))}
                </div>
            </div>
            <ModelPricingSection dark={props.dark} rows={props.pricingRows} />
        </div>
    );
}

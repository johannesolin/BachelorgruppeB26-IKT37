import styles from "../app/profil/page.module.css";
import { ModelPropertyRowProps } from "./types";

export function ModelPropertyRow(props: ModelPropertyRowProps) {
    return (
        <div className={`${styles.propertyRow} ${props.dark ? styles.propertyRowDark : styles.propertyRowLight}`}>
            <span className={styles.propertyIcon}>{props.icon}</span>
            <span className={styles.propertyLabel}>{props.label}</span>
            <span className={styles.propertyValue}>{props.value}</span>
        </div>
    );
}

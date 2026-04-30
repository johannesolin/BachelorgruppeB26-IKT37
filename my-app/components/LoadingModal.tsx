"use client";
import { createPortal } from "react-dom";
import { LoadingModalProps } from "./types";
import styles from "../app/page.module.css";

export function LoadingModal( props: LoadingModalProps ) {
    if(!props.busyGen) return null;

    return createPortal(
        <div className={`${styles.modalOverlayShow}`}>
            <div className={`${styles.modal} ${styles.configSection} ${
              props.darkMode ? styles.dark : styles.light
            }` }>
                <h2 className={`${styles.heading2} ${props.darkMode ? styles.dark : styles.light}`}>Laster...</h2>
            </div>
        </div>, 
        document.body
    );
}
"use client";
import { createPortal } from "react-dom";
import { Option, ProductSearchModalProps } from "./types";
import Select, { StylesConfig } from "react-select";
import styles from "../app/page.module.css";
import { ASSORTMENTCLASSNAME } from "@/templates/assortmentClassName";
import { useState } from "react";

const selectStyles: StylesConfig<Option, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: "auto",
    height: "auto",
    borderRadius: 8,
    borderColor: state.isFocused
      ? "var(--accent)"
      : "var(--border)",
    backgroundColor: "var(--surface)",
    boxShadow: state.isFocused
      ? "0 0 0 3px rgba(0, 102, 204, 0.1)"
      : "none",
    paddingLeft: 0,
    paddingRight: 0,
    "&:hover": {
      borderColor: "var(--accent)",
    },
    fontSize: 14,
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 8px",
  }),
  input: (base) => ({
    ...base,
    color: "var(--foreground)",
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--text-secondary)",
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--foreground)",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused
      ? "var(--accent)"
      : "var(--text-secondary)",
    paddingRight: 10,
    "&:hover": {
      color: "var(--accent)",
    },
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: "var(--border)",
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "var(--text-secondary)",
    "&:hover": {
      color: "var(--accent)",
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    zIndex: 20,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    backgroundColor: state.isSelected
      ? "var(--accent)"
      : state.isFocused
      ? "var(--neutral-light)"
      : "var(--surface)",
    color: state.isSelected ? "#ffffff" : "var(--foreground)",
    cursor: "pointer",
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: 220,
  }),
};









export function ProductSearchModal( props: ProductSearchModalProps ) {
    const [selectedValue, setSelecedValue] = useState<Option | null>(null)
    
    if(!props.searchModalState) return null;

    return createPortal(
        <div className={`${styles.modalOverlayShow}`}>
            <div className={`${styles.modal} ${styles.configSection} ${
              props.darkMode ? styles.dark : styles.light
            }` }>
                <h2 className={`${styles.heading2} ${props.darkMode ? styles.dark : styles.light}`}>Laster...</h2>
                <Select
                    className={`${styles.select} ${props.darkMode ? styles.dark : styles.light}`} 
                    options={ASSORTMENTCLASSNAME}
                    value={selectedValue}
                    onChange={(newValue) => setSelecedValue(newValue as Option | null)}
                    styles={selectStyles}
                    isClearable
                    isSearchable
                    placeholder="Søk i kategori"
                    noOptionsMessage={() => "Ingen treff"}
                />
                <button onClick={() => props.setSeachModalState(false)}>Lukk produktsøk</button>
            </div>
        </div>, 
        document.body
    );
}
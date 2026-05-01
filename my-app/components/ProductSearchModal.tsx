"use client";
import { createPortal } from "react-dom";
import { Option, ProductSearchModalProps } from "./types";
import styles from "../app/page.module.css";
import { ASSORTMENTCLASSNAME } from "@/templates/assortmentClassName";
import { useState } from "react";
import { SearchSelect } from "./SearchSelect";
import { AREANAME } from "@/templates/areaName";
import { CATEGORYNAME } from "@/templates/categoryName";

export function ProductSearchModal( props: ProductSearchModalProps ) {
  // State variabler for kategorivalg for produktsøk    
  const [selectedAssortment, setSelecedAssortment] = useState<Option | null>(null);
  const [selectedArea, setSelectedArea] = useState<Option | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);     
  
  // Sjekk om modal er aktivert
  if(!props.searchModalState) return null;

  // variabler med verdier for valg menyene.
  const assortmentOptions: Option[] = ASSORTMENTCLASSNAME;
  const areaOptions: Option[] = AREANAME;
  const categoryOptions: Option[] = CATEGORYNAME;      

  return createPortal(
      <div className={`${styles.modalOverlayShow}`}>
          <div className={`${styles.modal} ${styles.configSection} ${
            props.darkMode ? styles.dark : styles.light
          }` }>
              <h2 className={`${styles.heading2} ${props.darkMode ? styles.dark : styles.light}`}>Laster...</h2>
              <SearchSelect darkMode={props.darkMode} selectedValue={selectedArea} setSelectedValue={setSelectedArea} options={areaOptions}/>
              <SearchSelect darkMode={props.darkMode} selectedValue={selectedCategory} setSelectedValue={setSelectedCategory} options={categoryOptions}/>
              <SearchSelect darkMode={props.darkMode} selectedValue={selectedAssortment} setSelectedValue={setSelecedAssortment} options={assortmentOptions}/>
              <button onClick={() => props.setSeachModalState(false)}>Lukk produktsøk</button>
          </div>
      </div>, 
      document.body
  );
}
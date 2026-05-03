"use client";
import { createPortal } from "react-dom";
import { Option, ProductSearchModalProps } from "./types";
import styles from "../app/page.module.css";
import { ASSORTMENTCLASSNAME } from "@/templates/assortmentClassName";
import { useMemo, useState } from "react";
import { SearchSelect } from "./SearchSelect";
import { AREANAME } from "@/templates/areaName";
import { CATEGORYNAME } from "@/templates/categoryName";
import { ProductList } from "./ProductList";

export function ProductSearchModal( props: ProductSearchModalProps ) {
  // State variabler for kategorivalg for produktsøk    
  const [selectedAssortment, setSelecedAssortment] = useState<Option | null>(null);
  const [selectedArea, setSelectedArea] = useState<Option | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  
  // variabel for interaktivt søk i produktliste
  const filteredProductList = useMemo(() => {
    return props.productCategoryList.filter((product) => product.name.toLocaleLowerCase().includes(searchInput.toLocaleLowerCase())); 
  }, [props.productCategoryList, searchInput]);
  
  // Sjekk om modalen er aktivert og skal vises
  if(!props.searchModalState) return null;  

  // variabler med verdier for select menyene.
  const assortmentOptions: Option[] = ASSORTMENTCLASSNAME;
  const areaOptions: Option[] = AREANAME;
  const categoryOptions: Option[] = CATEGORYNAME;

  return createPortal(
      <div className={`${styles.modalOverlayShow}`}>
          <div className={`${styles.modal_select} ${styles.configSection} ${
            props.darkMode ? styles.dark : styles.light}`}
            >
              <h2 className={`${styles.heading2} ${props.darkMode ? styles.dark : styles.light}`}>Bruk Kategoriene til å søke etter produkter:</h2>
              <div className={`${styles.categorySelectFlex}`}>                
                <SearchSelect darkMode={props.darkMode} selectedValue={selectedArea} setSelectedValue={setSelectedArea} options={areaOptions}/>
                <SearchSelect darkMode={props.darkMode} selectedValue={selectedCategory} setSelectedValue={setSelectedCategory} options={categoryOptions}/>
                <SearchSelect darkMode={props.darkMode} selectedValue={selectedAssortment} setSelectedValue={setSelecedAssortment} options={assortmentOptions}/>
                <button onClick={() => props.productCategoriSearch(selectedArea?.value, selectedCategory?.value, selectedAssortment?.value)}>Søk</button>
              </div>
              <div className={`${styles.categorySelectFlex}`}>
                <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className={`${styles.input} ${props.darkMode ? styles.dark : styles.light} ${styles.productCategorySearchInput}`} type="text" placeholder="Søk på navn i produktlisten"/>
              </div>
              <div className={`${styles.productSearchList}`}>
                <ProductList addProductFromCategorySearch={props.addProductFromCategorySearch} selectedProducts={props.selectedProducts} filteredProductList={filteredProductList} darkMode={props.darkMode}/>
              </div>              
              <button className={`${styles.categorySearchCloseButton}`} onClick={() => props.setSeachModalState(false)}>Lukk produktsøk</button>
            </div>
      </div>, 
      document.body
  );
}
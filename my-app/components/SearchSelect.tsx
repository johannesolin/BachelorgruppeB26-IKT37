import Select, { StylesConfig } from "react-select";
import styles from "../app/page.module.css";
import { Option, SearchSelectProps } from "./types";

export function SearchSelect( props: SearchSelectProps ){
    const selectStyles: StylesConfig<Option, false> = {
      control: (base, state) => ({
        ...base,
        minHeight: "auto",
        height: "auto",
        borderRadius: 8,
        borderColor: state.isFocused
          ? "var(--accent)"
          : "var(--border)",
        backgroundColor: props.darkMode ? "#2a2a2a" : "#ffffff",
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
      // input tekst 
      input: (base) => ({
        ...base,
        color: props.darkMode ? "#ededed" : "#000000",
      }),
      placeholder: (base) => ({
        ...base,
        color: props.darkMode ? "#ededed" : "#000000",
      }),
      singleValue: (base) => ({
        ...base,
        color: props.darkMode ? "#ededed" : "#000000",
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
        backgroundColor: props.darkMode ? "#2a2a2a" : "#ffffff",
      }),
      clearIndicator: (base) => ({
        ...base,
        color: props.darkMode ? "#ededed" : "#000000",
        "&:hover": {
          color: props.darkMode ? "#ededed" : "#000000",
        },
      }),
      menu: (base) => ({
        ...base,
        borderRadius: 8,
        marginTop: 4,
        backgroundColor: props.darkMode ? "#2a2a2a" : "#ffffff",
        border: "1px solid var(--border)",
        zIndex: 20,
      }),
      option: (base, state) => ({
        ...base,
        fontSize: 14,
        backgroundColor: state.isSelected
          ? "var(--accent)"
          : props.darkMode ? "#2a2a2a" : "#ffffff",
        color: state.isSelected ? "#ffffff" : props.darkMode ? "#ededed" : "#000000",
        cursor: "pointer",
      }),
      menuList: (base) => ({
        ...base,
        maxHeight: 220,
      }),
    };

    return(
        <>
            <Select
                    options={props.options}
                    value={props.selectedValue}
                    onChange={(newValue) => props.setSelectedValue(newValue as Option | null)}
                    styles={selectStyles}
                    isClearable
                    isSearchable
                    placeholder="Søk i kategori"
                    noOptionsMessage={() => "Ingen treff"}
                />
        </>
    )

}
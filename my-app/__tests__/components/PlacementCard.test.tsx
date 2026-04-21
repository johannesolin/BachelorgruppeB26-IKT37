import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlacementCard } from "@/components/PlacementCard";

const mockPresets = [
  { id: "center", label: "Sentrum av bord", text: "Plasser produktet i sentrum av bordet." },
  { id: "left", label: "Venstre hjørne", text: "Plasser produktet i venstre hjørne." },
];

const mockProduct = {
  productId: 1,
  name: "Sofa",
  categoryName: "Furniture",
  images: [{ href: "img.jpg", category: "main", height: 100, width: 100 }],
  selectedImage: 0,
};

const baseProps = {
  placementPrompt: "Plasser produktet her",
  setPlacementPrompt: jest.fn(),
  darkMode: false,
  variants: 1,
  setVariants: jest.fn(),
  placeProductsInScene: jest.fn(),
  busyGen: false,
  busyScene: false,
  busyPlacement: false,
  selectedProducts: [mockProduct],
  selectedModel: "gpt-image-1.5" as const,
  scenePrompt: "Et stue miljø",
  placementPresets: mockPresets,
  selectedPlacementPreset: "",
  setSelectedPlacementPreset: jest.fn(),
  getPlacementSuggestion: jest.fn(),
};

describe("PlacementCard", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the textarea with the current placement prompt", () => {
    render(<PlacementCard {...baseProps} />);
    expect(screen.getByDisplayValue("Plasser produktet her")).toBeInTheDocument();
  });

  it("calls setPlacementPrompt when the textarea changes", async () => {
    const setPlacementPrompt = jest.fn();
    render(<PlacementCard {...baseProps} placementPrompt="" setPlacementPrompt={setPlacementPrompt} />);
    await userEvent.type(screen.getByRole("textbox"), "ny tekst");
    expect(setPlacementPrompt).toHaveBeenCalled();
  });  

  it("generate button is enabled when prompt is set and not busy", () => {
    render(<PlacementCard {...baseProps} />);
    expect(screen.getByRole("button", { name: /generer$/i })).toBeEnabled();
  });

  it("generate button is disabled when placement prompt is empty", () => {
    render(<PlacementCard {...baseProps} placementPrompt="" />);
    expect(screen.getByRole("button", { name: /generer/i })).toBeDisabled();
  });

  it("generate button is disabled when busyGen is true", () => {
    render(<PlacementCard {...baseProps} busyGen={true} />);
    expect(screen.getByRole("button", { name: /genererer\.\.\./i })).toBeDisabled();
  });

  it("generate button shows 'Genererer...' when busyGen", () => {
    render(<PlacementCard {...baseProps} busyGen={true} />);
    expect(screen.getByText("Genererer...")).toBeInTheDocument();
  });

  it("suggestion button is disabled when no products are selected", () => {
    render(<PlacementCard {...baseProps} selectedProducts={[]} />);
    expect(screen.getByRole("button", { name: /forslag fra språkmodell/i })).toBeDisabled();
  });

  it("suggestion button is disabled when no model is selected", () => {
    render(<PlacementCard {...baseProps} selectedModel="" />);
    expect(screen.getByRole("button", { name: /forslag fra språkmodell/i })).toBeDisabled();
  });

  it("suggestion button is disabled when scenePrompt is empty", () => {
    render(<PlacementCard {...baseProps} scenePrompt="" />);
    expect(screen.getByRole("button", { name: /forslag fra språkmodell/i })).toBeDisabled();
  });

  it("calls placeProductsInScene when generate button is clicked", async () => {
    const placeProductsInScene = jest.fn();
    render(<PlacementCard {...baseProps} placeProductsInScene={placeProductsInScene} />);
    await userEvent.click(screen.getByRole("button", { name: /generer$/i }));
    expect(placeProductsInScene).toHaveBeenCalledTimes(1);
  });

  it("calls getPlacementSuggestion when suggestion button is clicked", async () => {
    const getPlacementSuggestion = jest.fn();
    render(<PlacementCard {...baseProps} getPlacementSuggestion={getPlacementSuggestion} />);
    await userEvent.click(screen.getByRole("button", { name: /forslag fra språkmodell/i }));
    expect(getPlacementSuggestion).toHaveBeenCalledTimes(1);
  });

  it("calls setVariants when variants select changes", async () => {
    const setVariants = jest.fn();
    render(<PlacementCard {...baseProps} setVariants={setVariants} />);
    await userEvent.selectOptions(screen.getAllByRole("combobox")[0], "4");
    expect(setVariants).toHaveBeenCalledWith(4);
  });
});

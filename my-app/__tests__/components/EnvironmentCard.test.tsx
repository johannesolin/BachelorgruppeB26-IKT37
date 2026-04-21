import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnvironmentCard } from "@/components/EnvironmentCard";

const mockTemplates = [
  { id: "stue-soft", name: "Stue", type: "soft" as const, scenePrompt: "Et moderne stue miljø" },
  { id: "kjokken-hard", name: "Kjøkken", type: "hard" as const, scenePrompt: "Et lyst kjøkken" },
];

const baseProps = {
  templateId: "stue-soft",
  setTemplateId: jest.fn(),
  templates: mockTemplates,
  scenePrompt: "Et moderne stue miljø",
  setScenePrompt: jest.fn(),
  generateScene: jest.fn(),
  darkMode: false,
  sceneUrl: "",
  busyGen: false,
  busyScene: false,
  busyPlacement: false,
  sceneFixPrompt: "",
  setSceneFixPrompt: jest.fn(),
  refineScene: jest.fn(),
  selectedModel: "gpt-image-1.5" as const,
  setSelectedModel: jest.fn(),
};

describe("EnvironmentCard", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders template options", () => {
    render(<EnvironmentCard {...baseProps} />);
    expect(screen.getByRole("option", { name: /stue/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /kjøkken/i })).toBeInTheDocument();
  });

  it("shows 'Generer Miljø' when sceneUrl is empty and not busy", () => {
    render(<EnvironmentCard {...baseProps} />);
    expect(screen.getByRole("button", { name: "Generer Miljø" })).toBeInTheDocument();
  });

  it("shows 'Regenerer Miljø' when sceneUrl is set", () => {
    render(<EnvironmentCard {...baseProps} sceneUrl="http://example.com/scene.jpg" />);
    expect(screen.getByRole("button", { name: "Regenerer Miljø" })).toBeInTheDocument();
  });

  it("shows 'Genererer Miljø' when busyScene is true", () => {
    render(<EnvironmentCard {...baseProps} busyScene={true} />);
    expect(screen.getByText("Genererer Miljø")).toBeInTheDocument();
  });

  it("generate button is disabled when no model is selected", () => {
    render(<EnvironmentCard {...baseProps} selectedModel="" />);
    expect(screen.getByRole("button", { name: "Generer Miljø" })).toBeDisabled();
  });

  it("generate button is disabled when busyGen is true", () => {
    render(<EnvironmentCard {...baseProps} busyGen={true} />);
    expect(screen.getByRole("button", { name: "Generer Miljø" })).toBeDisabled();
  });

  it("generate button is disabled when busyScene is true", () => {
    render(<EnvironmentCard {...baseProps} busyScene={true} />);
    expect(screen.getByRole("button", { name: "Genererer Miljø" })).toBeDisabled();
  });

  it("calls generateScene when the generate button is clicked", async () => {
    const generateScene = jest.fn();
    render(<EnvironmentCard {...baseProps} generateScene={generateScene} />);
    await userEvent.click(screen.getByRole("button", { name: "Generer Miljø" }));
    expect(generateScene).toHaveBeenCalledTimes(1);
  });

  it("changing template calls setTemplateId and setScenePrompt with the template's prompt", async () => {
    const setTemplateId = jest.fn();
    const setScenePrompt = jest.fn();
    render(<EnvironmentCard {...baseProps} setTemplateId={setTemplateId} setScenePrompt={setScenePrompt} />);
    const templateSelect = screen.getAllByRole("combobox").find(s =>
      Array.from(s.querySelectorAll("option")).some(o => o.value === "kjokken-hard")
    );
    await userEvent.selectOptions(templateSelect!, "kjokken-hard");
    expect(setTemplateId).toHaveBeenCalledWith("kjokken-hard");
    expect(setScenePrompt).toHaveBeenCalledWith("Et lyst kjøkken");
  });

  it("shows empty scene placeholder when sceneUrl is empty and not busy", () => {
    render(<EnvironmentCard {...baseProps} />);
    expect(screen.getByText("Ingen scene")).toBeInTheDocument();
  });

  it("shows the scene image when sceneUrl is provided", () => {
    render(<EnvironmentCard {...baseProps} sceneUrl="http://example.com/scene.jpg" />);
    expect(screen.getByAltText("scene")).toHaveAttribute("src", "http://example.com/scene.jpg");
  });

  it("shows loading indicator when busyGen is true", () => {
    render(<EnvironmentCard {...baseProps} busyGen={true} />);
    expect(screen.getByText("Laster/genererer...")).toBeInTheDocument();
  });

  it("shows the refine input when sceneUrl is set", () => {
    render(<EnvironmentCard {...baseProps} sceneUrl="http://example.com/scene.jpg" />);
    expect(screen.getByPlaceholderText(/Ta bort/i)).toBeInTheDocument();
  });

  it("refine button is disabled when sceneFixPrompt is empty", () => {
    render(<EnvironmentCard {...baseProps} sceneUrl="http://example.com/scene.jpg" sceneFixPrompt="" />);
    expect(screen.getByRole("button", { name: "Fiks scene" })).toBeDisabled();
  });

  it("refine button is enabled when sceneFixPrompt has content", () => {
    render(
      <EnvironmentCard
        {...baseProps}
        sceneUrl="http://example.com/scene.jpg"
        sceneFixPrompt="Ta bort stolen"
      />
    );
    expect(screen.getByRole("button", { name: "Fiks scene" })).toBeEnabled();
  });

  it("calls refineScene when the refine button is clicked", async () => {
    const refineScene = jest.fn();
    render(
      <EnvironmentCard
        {...baseProps}
        sceneUrl="http://example.com/scene.jpg"
        sceneFixPrompt="Endre fargen"
        refineScene={refineScene}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Fiks scene" }));
    expect(refineScene).toHaveBeenCalledTimes(1);
  });
});

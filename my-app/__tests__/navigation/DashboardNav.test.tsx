import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardNav } from "@/app/navigation/DashboardNav";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("DashboardNav", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders all three navigation buttons", () => {
    render(<DashboardNav darkMode={false} />);
    expect(screen.getByRole("button", { name: /bruker/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /søk i produkter/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /kontrollpanel/i })).toBeInTheDocument();
  });

  it("clicking a nav button calls router.push with the correct path", async () => {
    render(<DashboardNav darkMode={false} />);
    await userEvent.click(screen.getByRole("button", { name: /søk i produkter/i }));
    expect(mockPush).toHaveBeenCalledWith("/products");
  });

  it("clicking a nav button calls router.push for the dashboard path", async () => {
    render(<DashboardNav darkMode={false} />);
    await userEvent.click(screen.getByRole("button", { name: /kontrollpanel/i }));
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("shows 'Dempet tema' toggle button when darkMode is false", () => {
    render(<DashboardNav darkMode={false} />);
    expect(screen.getByRole("button", { name: /dempet tema/i })).toBeInTheDocument();
  });

  it("shows 'Normalt tema' toggle button when darkMode is true", () => {
    render(<DashboardNav darkMode={true} />);
    expect(screen.getByRole("button", { name: /normalt tema/i })).toBeInTheDocument();
  });

  it("calls onDarkModeChange(true) when theme is toggled from light", async () => {
    const onDarkModeChange = jest.fn();
    render(<DashboardNav darkMode={false} onDarkModeChange={onDarkModeChange} />);
    await userEvent.click(screen.getByRole("button", { name: /dempet tema/i }));
    expect(onDarkModeChange).toHaveBeenCalledWith(true);
  });

  it("calls onDarkModeChange(false) when theme is toggled from dark", async () => {
    const onDarkModeChange = jest.fn();
    render(<DashboardNav darkMode={true} onDarkModeChange={onDarkModeChange} />);
    await userEvent.click(screen.getByRole("button", { name: /normalt tema/i }));
    expect(onDarkModeChange).toHaveBeenCalledWith(false);
  });

  it("renders the logout button", () => {
    render(<DashboardNav darkMode={false} />);
    expect(screen.getByRole("button", { name: /logg ut/i })).toBeInTheDocument();
  });

  it("does not throw when onDarkModeChange is not provided", async () => {
    render(<DashboardNav darkMode={false} />);
    await expect(
      userEvent.click(screen.getByRole("button", { name: /dempet tema/i }))
    ).resolves.not.toThrow();
  });
});

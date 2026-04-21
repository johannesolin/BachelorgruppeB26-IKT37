import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResultsCard } from "@/components/ResultsCard";

const baseProps = {
  darkMode: false,
  resultDataUrls: [],
  selectedVariant: 0,
  setSelectedVariant: jest.fn(),
};

describe("ResultsCard", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows empty-state text when there are no results", () => {
    render(<ResultsCard {...baseProps} />);
    expect(screen.getByText("Ingen resultat ennå")).toBeInTheDocument();
  });

  it("does not show empty-state text when results exist", () => {
    render(<ResultsCard {...baseProps} resultDataUrls={["data:image/png;base64,abc"]} />);
    expect(screen.queryByText("Ingen resultat ennå")).not.toBeInTheDocument();
  });

  it("renders the selected variant image", () => {
    render(
      <ResultsCard
        {...baseProps}
        resultDataUrls={["data:image/png;base64,img1", "data:image/png;base64,img2"]}
        selectedVariant={0}
      />
    );
    const mainImg = screen.getByAltText("selected-result");
    expect(mainImg).toHaveAttribute("src", "data:image/png;base64,img1");
  });

  it("renders one thumbnail button per variant", () => {
    render(
      <ResultsCard
        {...baseProps}
        resultDataUrls={["url1", "url2", "url3"]}
        selectedVariant={0}
      />
    );
    expect(screen.getAllByAltText(/variant-/)).toHaveLength(3);
  });

  it("calls setSelectedVariant with the correct index when a thumbnail is clicked", async () => {
    const setSelectedVariant = jest.fn();
    render(
      <ResultsCard
        {...baseProps}
        resultDataUrls={["url1", "url2"]}
        selectedVariant={0}
        setSelectedVariant={setSelectedVariant}
      />
    );
    const thumbnails = screen.getAllByRole("button");
    await userEvent.click(thumbnails[1]);
    expect(setSelectedVariant).toHaveBeenCalledWith(1);
  });

  it("shows the heading when results exist", () => {
    render(<ResultsCard {...baseProps} resultDataUrls={["url1"]} />);
    expect(screen.getByText("Velg beste variant")).toBeInTheDocument();
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductCard } from "@/components/ProductCard";

const makeProduct = (imageCount = 3) => ({
  productId: 1,
  name: "Sofa",
  categoryName: "Furniture",
  selectedImage: 0,
  images: Array.from({ length: imageCount }, (_, i) => ({
    href: `http://example.com/img${i}.jpg`,
    category: "main",
    height: 100,
    width: 100,
  })),
});

const baseProps = {
  product: makeProduct(),
  selectedProducts: [makeProduct(), makeProduct()],
  index: 1,
  moveProduct: jest.fn(),
  removeProduct: jest.fn(),
  changeSelectedImage: jest.fn(),
};

describe("ProductCard", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the product id and name", () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText(/1\s*–\s*Sofa/)).toBeInTheDocument();
  });

  it("shows the correct image counter initially", () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText("1/3")).toBeInTheDocument();
  });

  it("left arrow is disabled at the first image", () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByTitle ? screen.getByRole("button", { name: "←" }) : screen.getAllByRole("button").find(b => b.textContent === "←")).toBeDisabled();
  });

  it("right arrow is enabled when there are more images", () => {
    render(<ProductCard {...baseProps} />);
    const rightArrow = screen.getAllByRole("button").find(b => b.innerHTML.includes("8594") || b.textContent === "→");
    expect(rightArrow).toBeEnabled();
  });

  it("advances to next image on right arrow click", async () => {
    render(<ProductCard {...baseProps} />);
    const buttons = screen.getAllByRole("button");
    const rightArrow = buttons.find(b => b.innerHTML.includes("8594") || b.textContent?.includes("→"));
    await userEvent.click(rightArrow!);
    expect(screen.getByText("2/3")).toBeInTheDocument();
  });

  it("right arrow is disabled at the last image", async () => {
    render(<ProductCard {...baseProps} product={makeProduct(1)} />);
    const buttons = screen.getAllByRole("button");
    const rightArrow = buttons.find(b => b.innerHTML.includes("8594") || b.textContent?.includes("→"));
    expect(rightArrow).toBeDisabled();
  });

  it("up arrow (↑) is disabled when index is 0", () => {
    render(<ProductCard {...baseProps} index={0} />);
    expect(screen.getByTitle("Flytt opp")).toBeDisabled();
  });

  it("up arrow (↑) is enabled when index > 0", () => {
    render(<ProductCard {...baseProps} index={1} />);
    expect(screen.getByTitle("Flytt opp")).toBeEnabled();
  });

  it("down arrow (↓) is disabled at the last position", () => {
    const products = [makeProduct(), makeProduct()];
    render(<ProductCard {...baseProps} selectedProducts={products} index={1} />);
    expect(screen.getByTitle("Flytt ned")).toBeDisabled();
  });

  it("calls moveProduct(-1) when up button is clicked", async () => {
    const moveProduct = jest.fn();
    render(<ProductCard {...baseProps} index={1} moveProduct={moveProduct} />);
    await userEvent.click(screen.getByTitle("Flytt opp"));
    expect(moveProduct).toHaveBeenCalledWith(1, -1);
  });

  it("calls removeProduct with the product id", async () => {
    const removeProduct = jest.fn();
    render(<ProductCard {...baseProps} removeProduct={removeProduct} />);
    await userEvent.click(screen.getByTitle("Fjern"));
    expect(removeProduct).toHaveBeenCalledWith(1);
  });
});

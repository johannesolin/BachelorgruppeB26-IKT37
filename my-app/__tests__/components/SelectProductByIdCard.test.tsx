import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectproductByIdCard } from "@/components/SelectProductByIdCard";

const baseProps = {
  productIdInput: "",
  setProductIdInput: jest.fn(),
  darkMode: false,
  addProductId: jest.fn(),
  selectedProducts: [],
};

describe("SelectproductByIdCard", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the input and button", () => {
    render(<SelectproductByIdCard {...baseProps} />);
    expect(screen.getByPlaceholderText("Produktnummer Her...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /legg til/i })).toBeInTheDocument();
  });

  it("disables the button when input is empty", () => {
    render(<SelectproductByIdCard {...baseProps} productIdInput="" />);
    expect(screen.getByRole("button", { name: /legg til/i })).toBeDisabled();
  });

  it("enables the button when input has a value and fewer than 4 products are selected", () => {
    render(<SelectproductByIdCard {...baseProps} productIdInput="123" />);
    expect(screen.getByRole("button", { name: /legg til/i })).toBeEnabled();
  });

  it("disables the button when 4 products are already selected", () => {
    const fourProducts = Array.from({ length: 4 }, (_, i) => ({
      productId: i,
      name: `P${i}`,
      categoryName: "cat",
      images: [],
      selectedImage: 0,
    }));
    render(<SelectproductByIdCard {...baseProps} productIdInput="999" selectedProducts={fourProducts} />);
    expect(screen.getByRole("button", { name: /legg til/i })).toBeDisabled();
  });

  it("calls addProductId when the button is clicked", async () => {
    const addProductId = jest.fn();
    render(<SelectproductByIdCard {...baseProps} productIdInput="42" addProductId={addProductId} />);
    await userEvent.click(screen.getByRole("button", { name: /legg til/i }));
    expect(addProductId).toHaveBeenCalledTimes(1);
  });

  it("calls setProductIdInput when the input changes", async () => {
    const setProductIdInput = jest.fn();
    render(<SelectproductByIdCard {...baseProps} setProductIdInput={setProductIdInput} />);
    await userEvent.type(screen.getByPlaceholderText("Produktnummer Her..."), "5");
    expect(setProductIdInput).toHaveBeenCalled();
  });
});

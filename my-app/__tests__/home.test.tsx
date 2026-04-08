import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

describe("Home", () => {
  it("renders a heading", () => {
    render(<h1>Hello Next.js</h1>);

    const heading = screen.getByRole("heading", {
      name: /hello next\.js/i,
    });

    expect(heading).toBeInTheDocument();
  });
});

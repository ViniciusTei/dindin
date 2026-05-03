import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Icon from "./Icon";

describe("Icon", () => {
  it("renders team icon", () => {
    render(<Icon name="team" className="h-4 w-4" />);
    expect(document.querySelector("svg")).toBeTruthy();
  });

  it("renders trash icon", () => {
    render(<Icon name="trash" className="h-4 w-4" />);
    expect(document.querySelector("svg")).toBeTruthy();
  });

  it("renders pencil icon", () => {
    render(<Icon name="pencil" className="h-4 w-4" />);
    expect(document.querySelector("svg")).toBeTruthy();
  });

  it("renders menu-fold icon", () => {
    render(<Icon name="menu-fold" className="h-4 w-4" />);
    expect(document.querySelector("svg")).toBeTruthy();
  });

  it("renders menu-unfold icon", () => {
    render(<Icon name="menu-unfold" className="h-4 w-4" />);
    expect(document.querySelector("svg")).toBeTruthy();
  });
});

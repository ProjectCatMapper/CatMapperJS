import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HeaderLocationValue from "./HeaderLocationValue";

describe("header location preview", () => {
  let container, root, resize, scrollHeight;
  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    scrollHeight = 150;
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(() => scrollHeight);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback) { resize = callback; }
      observe() {}
      disconnect() {}
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  it("opens the complete location when the five-line preview overflows", () => {
    const viewMore = vi.fn();
    const text = Array.from({ length: 30 }, (_, i) => `District ${i}`).join(", ");
    act(() => root.render(<HeaderLocationValue text={text} onViewMore={viewMore} />));
    expect(container.querySelector(".category-info-location-lines").textContent).toBe(text);
    const button = container.querySelector("button");
    expect(button.textContent).toBe("View more");
    act(() => button.click());
    expect(viewMore).toHaveBeenCalledOnce();
    // Wider layouts remove the control when all the text fits.
    scrollHeight = 80;
    act(() => resize());
    expect(container.querySelector("button")).toBeNull();
  });
  it("keeps short locations free of an expansion control", () => {
    scrollHeight = 80;
    act(() => root.render(<HeaderLocationValue text="One district" onViewMore={vi.fn()} />));
    expect(container.querySelector("button")).toBeNull();
  });
});

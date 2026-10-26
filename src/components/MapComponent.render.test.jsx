import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MapComponent from "./MapComponent";
import { shouldUseDeckGlMap } from "./mapDeckLayers";

const captured = vi.hoisted(() => ({ deck: null, circles: [], polygons: [] }));

vi.mock("@deck.gl/react", async () => ({
  default: (await import("react")).forwardRef((props, _ref) => {
    captured.deck = props;
    return <div>{props.children}</div>;
  }),
}));
vi.mock("@deck.gl/layers", () => {
  class Layer { constructor(props) { this.props = props; } }
  return { ScatterplotLayer: Layer, TextLayer: Layer, GeoJsonLayer: Layer };
});
vi.mock("react-map-gl/maplibre", () => ({ Map: () => null }));
vi.mock("./mapDeckLayers", async (original) => ({
  ...await original(), shouldUseDeckGlMap: vi.fn(() => true),
}));
vi.mock("react-leaflet", async () => ({
  MapContainer: (await import("react")).forwardRef(({ children }, _ref) => <div>{children}</div>),
  TileLayer: () => null,
  Tooltip: ({ children }) => <div>{children}</div>,
  GeoJSON: (props) => { captured.polygons.push(props); return null; },
  CircleMarker: (props) => { captured.circles.push(props); return <div>{props.children}</div>; },
  useMap: () => ({ fitBounds: vi.fn() }),
}));
vi.mock("@changey/react-leaflet-markercluster", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

const PointA = { CMID: "SM2", CMName: "Basti", source: "Dataset A", cood: [10, 20] };
const PointB = { CMID: "SM3", CMName: "Kizombo", source: "Dataset B", cood: [11, 21] };
const LocationProbe = () => <output>{useLocation().pathname}</output>;

describe("node info maps", () => {
  let container, root;
  beforeEach(() => {
    captured.deck = null;
    captured.circles = [];
    captured.polygons = [];
    shouldUseDeckGlMap.mockReturnValue(true);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.restoreAllMocks();
  });

  const render = (props = {}) => act(() => root.render(
    <MemoryRouter initialEntries={["/sociomap/SM1/map"]}>
      <MapComponent points={[PointA, PointB]} database="sociomap" {...props} />
      <LocationProbe />
    </MemoryRouter>
  ));
  const scatter = () => captured.deck.layers.find((layer) => layer.props.id === "scatter-layer").props;

  it("restores category legends with swatches matching opaque point colors", () => {
    render();
    const points = scatter();
    expect(points.opacity).toBe(1);
    expect(points.getFillColor(PointA)).not.toEqual(points.getFillColor(PointB));
    const legend = container.querySelector('[aria-label="Map legend"]');
    expect(legend.textContent).toContain("Dataset A");
    expect(legend.textContent).toContain("Dataset B");
    const rgb = points.getFillColor(PointA);
    expect(rgb[3]).toBe(255);
    expect(legend.querySelector("span").style.background).toBe(`rgb(${rgb.slice(0, 3).join(", ")})`);
  });

  it("keeps dataset maps in one color without a legend", () => {
    render({ mapType: "dataset" });
    expect(scatter().getFillColor(PointA)).toEqual(scatter().getFillColor(PointB));
    expect(container.querySelector('[aria-label="Map legend"]')).toBeNull();
  });

  it("opens the mapped node when an individual point is clicked", () => {
    render();
    act(() => captured.deck.onClick({ object: scatter().data[0] }));
    expect(container.querySelector("output").textContent).toBe("/sociomap/SM2");
  });

  it("keeps coincident points selectable and provides a link for each node", () => {
    render({ points: [PointA, { ...PointB, cood: PointA.cood }] });
    const group = captured.deck.layers.find((layer) => layer.props.id === "point-stack-ring-0").props.data[0];
    act(() => captured.deck.onClick({ object: group }));
    expect(container.querySelector("output").textContent).toBe("/sociomap/SM1/map");
    const links = [...container.querySelectorAll('[role="dialog"] a')];
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/sociomap/SM2", "/sociomap/SM3"]);
    const expanded = captured.deck.layers.find((layer) => layer.props.id === "expanded-stack-points").props.data;
    act(() => captured.deck.onClick({ object: expanded[1] }));
    expect(container.querySelector("output").textContent).toBe("/sociomap/SM3");
  });

  it("navigates inherited polygons using their category identity", () => {
    render({ layers: [{
      id: "uses:CATEGORY", mode: "uses", points: [], polygons: [{
        type: "Feature", properties: { source: "Dataset A", sourceNodeCMID: "SM7" },
        geometry: { type: "Polygon", coordinates: [[[10, 20], [11, 20], [11, 21], [10, 20]]] },
      }],
    }] });
    const feature = captured.deck.layers.find((layer) => layer.props.id === "polygon-layer").props.data.features[0];
    act(() => captured.deck.onClick({ object: feature }));
    expect(container.querySelector("output").textContent).toBe("/sociomap/SM7");
  });

  it("keeps Leaflet point fills opaque and makes them navigable", () => {
    shouldUseDeckGlMap.mockReturnValue(false);
    render();
    expect(captured.circles[0].fillOpacity).toBe(1);
    act(() => captured.circles[0].eventHandlers.click());
    expect(container.querySelector("output").textContent).toBe("/sociomap/SM2");
  });
});

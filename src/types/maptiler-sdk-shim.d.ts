// Temporary shim to avoid heavy/recursive typings that can crash some TS toolchains.
// Runtime still uses the real '@maptiler/sdk' package; this only simplifies type-checking.

declare module "@maptiler/sdk" {
  export const config: { apiKey: string };

  export const MapStyle: any;

  export class Map {
    constructor(options: any);
    on(type: string, handler: any): void;
    remove(): void;
    flyTo(options: any): void;
  }

  export class Marker {
    constructor(options?: any);
    setLngLat(lngLat: [number, number]): this;
    addTo(map: any): this;
    remove(): void;
    getElement(): HTMLElement;
  }
}

declare module "@maptiler/sdk/dist/maptiler-sdk.css";

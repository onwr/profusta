export type ServiceAreasConfig = {
  enabled: Record<string, string[]>;
};

export type ResolvedServiceArea = {
  city: string;
  district: string;
  provinceSlug: string;
  townSlug: string;
  lat: number;
  lng: number;
};

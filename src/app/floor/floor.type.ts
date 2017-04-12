export interface Floor {
  id?: number;
  level: number;
  name: string;
  buildingId: number;
  imageId?: number;
}

export interface ImageConfiguration {
  maxFileSize: number;
  allowedTypes: string[];
}

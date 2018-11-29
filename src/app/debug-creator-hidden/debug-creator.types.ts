export interface DebugReport {
  id: number;
  creationDate?: string;
  modificationDate?: string;
  data?: Array<string>
  name: string;
  reportType: string;
}

export enum DebugReportType {
  RAW_DATA = 'RAW',
  COORDINATES = 'COORDINATES'
}

export class DebugFileName {
  rawMeasurements: string;
  coordinates: string;
  constructor(rawMeasurements, coordinates) {
    this.rawMeasurements = rawMeasurements;
    this.coordinates = coordinates;
  }
}

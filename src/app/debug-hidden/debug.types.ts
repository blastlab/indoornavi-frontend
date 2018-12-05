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
  rawMeasures: string;
  coordinates: string;
  constructor(rawMeasures, coordinates) {
    this.rawMeasures = rawMeasures;
    this.coordinates = coordinates;
  }
}

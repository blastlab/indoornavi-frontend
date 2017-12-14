import {CoordinatesSocketData} from '../public/published.type';

export interface TimeStepBuffer {
  data: CoordinatesSocketData;
  timeOfDataStep: number;
}

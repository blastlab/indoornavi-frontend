import {CoordinatesSocketData} from '../../published.type';

export interface TimeStepBuffer {
  data: CoordinatesSocketData;
  timeOfDataStep: number;
}

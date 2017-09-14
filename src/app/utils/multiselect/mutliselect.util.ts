import {Option} from './multiselect.type';

export class MultiSelectUtils {
  public static extractOptionData(option: Option): any {
    return option.data;
  }
}

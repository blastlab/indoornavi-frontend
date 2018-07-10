import {Point} from '../../../map-editor/map.type';
import {SelectTag, Tag} from '../../../device/device.type';
import {AreaConfiguration, AreaConfigurationDto} from '../../../map-editor/tool-bar/tools/area/areas.type';

export class Helper {

  static deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)); // this is a special way to make a deep copy
  }

  static getChildrenExtremeValues(parentElement: SVGElement): Point {
    let extremeLeftX = 0;
    let extremeTopY = 0;
    const childrenCount: number = parentElement.childElementCount;
    const children: NodeList = parentElement.childNodes;
    for (let i = 0; i < childrenCount; i++) {
      if (!!children[i]['attributes']['class'] && children[i]['attributes']['class'].value !== 'dragarea') {
        const childX: number = children[i]['attributes']['x'].value;
        const childY: number = children[i]['attributes']['y'].value;
        extremeLeftX = (childX < extremeLeftX) ? childX : extremeLeftX;
        extremeTopY = (childY < extremeTopY) ? childY : extremeTopY;
      }
    }
    return {x: extremeLeftX, y: extremeTopY};
  }

  static respondToOrigin(event: number, id: number, originMessageEvent: MessageEvent): void {
    originMessageEvent.source.postMessage({type: `${event.toString(10)}-${id.toString(10)}`, objectId: id}, originMessageEvent.origin);
  }

  static transformToAreaDtoFormat(configObject: AreaConfiguration): AreaConfigurationDto {
    const areaConfigurationDto: AreaConfigurationDto = new AreaConfigurationDto();
    Object.keys(configObject).forEach((key: any): void => {
      if (key === 'tags') {
        configObject[key].forEach((tag: SelectTag): void => {
          areaConfigurationDto[key].push(
            {
              id: tag['id'],
              name: tag['name'],
              shortId: tag['shortId'],
              longId: tag['longId'],
              verified: tag['verified'],
              x: tag['x'],
              y: tag['y'],
              z: tag['z'],
              floorId: tag['floorId'],
              firmwareVersion: tag['firmwareVersion'],
            });
        });
      } else {
        areaConfigurationDto[key] = configObject[key]
      }
    });
    return areaConfigurationDto;
  }

  static transformToMultiselectTagsConfigurationFormat(tags: Tag[]): Tag[] {
    const transformedTags = [];
    tags.forEach((tag: Tag): void => {
      const selectTag: SelectTag = new SelectTag();
      Object.keys(tag).forEach(key => selectTag[key] = tag[key]);
      selectTag.shortIdSelect = tag.shortId.toString();
      transformedTags.push(selectTag);
    });
    return transformedTags;
  }

}

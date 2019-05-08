import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {ListLayerEntity} from '../../../../shared/utils/drawing/drawing.builder';

@Injectable()
export class LayersService {
  private layersListUpdate: Subject<ListLayerEntity[]> = new Subject<ListLayerEntity[]>();
  private layerVisibilityChange: Subject<number> = new Subject<number>();

  onLayerListUpdate(): Observable<ListLayerEntity[]> {
    return this.layersListUpdate.asObservable();
  }

  emitLayersListUpdate(layersList: ListLayerEntity[]): void {
    this.layersListUpdate.next(layersList);
  }

  emitLayerVisibilityChange(id: number): void {
    this.layerVisibilityChange.next(id);
  }

  onLayerVisibilityChange(): Observable<number> {
    return this.layerVisibilityChange.asObservable();
  }
}

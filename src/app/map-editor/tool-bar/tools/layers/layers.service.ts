import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {ListLayerEntity} from '../../../../shared/utils/drawing/drawing.builder';

@Injectable()
export class LayersService {
  private layersListUpdate: Subject<ListLayerEntity[]> = new Subject<ListLayerEntity[]>();
  private layerVisibilityChange: Subject<number> = new Subject<number>();
  private listVisibility: Subject<boolean> = new Subject<boolean>();

  onListVisibilityChange(): Observable<boolean> {
    return this.listVisibility.asObservable();
  }

  onLayerVisibilityChange(): Observable<number> {
    return this.layerVisibilityChange.asObservable();
  }

  onLayerListUpdate(): Observable<ListLayerEntity[]> {
    return this.layersListUpdate.asObservable();
  }

  emitListVisibility(value: boolean): void {
    this.listVisibility.next(value);
  }

  emitLayersListUpdate(layersList: ListLayerEntity[]): void {
    this.layersListUpdate.next(layersList);
  }

  emitLayerVisibilityChange(id: number): void {
    this.layerVisibilityChange.next(id);
  }
}

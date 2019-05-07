import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {ListLayerEntity} from '../../../../shared/utils/drawing/drawing.builder';

@Injectable()
export class LayersService {
  private layersListUpdate: Subject<ListLayerEntity[]> = new Subject<ListLayerEntity[]>();

  onLayerListUpdate(): Observable<ListLayerEntity[]> {
    return this.layersListUpdate.asObservable();
  }

  emitLayersListUpdate(layersList: ListLayerEntity[]): void {
    this.layersListUpdate.next(layersList);
  }
}

import {ListLayerEntity, SvgGroupLayer} from './drawing.builder';

export class LayersOwner {
  private static instance: LayersOwner;
  private layers: Map<number, SvgGroupLayer> = new Map();

  static getInstance(): LayersOwner {
    if (!LayersOwner.instance) {
      LayersOwner.instance = new LayersOwner();

    }
    return LayersOwner.instance;
  }

  private constructor() {}

  getIdsAndNames(): ListLayerEntity[] {
    const layersEntities: ListLayerEntity[] = [];
    this.layers.forEach((value: SvgGroupLayer, key: number) => {
      layersEntities.push({id: key, name: value.getLayerName()});
    });
    return layersEntities;
  }

  addLayer(layer: SvgGroupLayer): number {
    const id = this.findIdFromAvailableIds();
    this.layers.set(id, layer);
    return id;
  }

  showLayerById(id: number) {
    this.layers.get(id).setVisible();
  }

  hideLayerById(id: number) {
    this.layers.get(id).setHidden();
  }

  updateLayerById(id: number, layer: SvgGroupLayer) {
    this.layers.set(id, layer);
  }

  removeLayerById(id: number): boolean {
    return this.layers.delete(id);
  }

  private findIdFromAvailableIds(): number {
    const ids: number[] = Array.from(this.layers.keys()).sort();
    let id = Math.max(...ids) + 1;
    for (let i = 1; i <= id; i++) {
      if (ids[i - 1] !== i) {
        id = i;
        break;
      }
    }
    return id > 0 ? id : 0;
  }
}

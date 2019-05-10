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
      layersEntities.push({id: key, name: value.getLayerName(), visible: value.getVisibility()});
    });
    return layersEntities;
  }

  getLayerVisibilityById(id: number): boolean {
    return this.layers.get(id).getVisibility();
  }

  addLayer(layer: SvgGroupLayer): number {
    const id = this.findIdFromAvailableIds();
    layer.setVisible();
    this.layers.set(id, layer);
    console.log(this.layers);
    return id;
  }

  updateLayerById(id: number, layer: SvgGroupLayer) {
    layer.setVisible();
    this.layers.set(id, layer);
  }

  showLayerById(id: number) {
    this.layers.get(id).setVisible();
  }

  hideLayerById(id: number) {
    this.layers.get(id).setHidden();
  }

  removeLayerById(id: number): boolean {
    return this.layers.delete(id);
  }

  private findIdFromAvailableIds(): number {
    const ids: number[] = Array.from(this.layers.keys()).sort();
    let id = Math.max(...ids) + 1;
    for (let i = 1; i <= id; i++) {
      if (ids[i] !== i) {
        id = i;
        break;
      }
    }
    return id > 0 ? id : 0;
  }
}

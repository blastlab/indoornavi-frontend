import {Injectable} from '@angular/core';

@Injectable()
export class DashboardService {
  private shortIdToNameMapping: Map<number, string> = new Map<number, string>();

  getDeviceName(shortId: number): string {
    return this.shortIdToNameMapping.get(shortId) ? this.shortIdToNameMapping.get(shortId) : shortId.toString();
  }

  set(shortId: number, name: string) {
    this.shortIdToNameMapping.set(shortId, name);
  }
}

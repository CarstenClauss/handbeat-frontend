import {Injectable} from '@angular/core';
import {DragAndDropData} from './drag-and-drop-data';
import {environment} from '../environments/environment';
import {String} from 'typescript-string-operations';

@Injectable({
  providedIn: 'root'
})
export class DragAndDropDataTransferService {
  private _transfer: Map<number, any> = new Map<number, any>();
  private _currentIdx = 0;

  public register(value: any): number {
    this._transfer.set(this._currentIdx, value);
    return this._currentIdx++;
  }

  public has(id: number): boolean {
    return this._transfer.has(id);
  }

  public fetch(id: number, keep: boolean = true): any {
    if (this._transfer.has(id)) {
      const value: any = this._transfer.get(id);
      if (keep === false) {
        this._transfer.delete(id);
      }
      return value;
    } else {
      return null;
    }
  }

  public remove(id: number) {
    if (this._transfer.has(id)) {
      this._transfer.delete(id);
    }
  }

  public removeFromEvent(event: DragEvent): void {
    const dndData: string = event.dataTransfer.getData(environment.mimeType);
    if (dndData.length > 0) {
      const id = parseInt(dndData, 10);
      if (isNaN(id) === false && this.has(id)) {
        this.remove(id);
      }
    }
  }

  public fromEvent(event: DragEvent, subtype: string = null, keep: boolean = true): DragAndDropData {
    const dndData: string = event.dataTransfer.getData(this.expandType(subtype));
    if (dndData.length > 0) {
      const id = parseInt(dndData, 10);
      if (isNaN(id) === false && this.has(id)) {
        return this.fetch(id, keep);
      }
    }
    return null;
  }

  public toEvent(event: DragEvent, data: DragAndDropData): number {
    const id = this.register(data);
    event.dataTransfer.setData(this.expandType(data.type), id.toString(10));
    return id;
  }

  public hasType(event: DragEvent, subtype: string = null) {
    if (subtype != null) {
      return event.dataTransfer.types.includes(String.Format('{0}.{1}', environment.mimeType, subtype));
    } else {
      return event.dataTransfer.types.filter(value => {
        return value.includes(environment.mimeType);
      }).length !== 0;
    }
  }

  public expandType(subtype: string = null): string {
    if (subtype != null) {
      return String.Format('{0}.{1}', environment.mimeType, subtype);
    } else {
      return environment.mimeType;
    }
  }
}

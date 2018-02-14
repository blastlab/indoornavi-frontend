import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {TagToggle} from './tag-toggle.type';
import {Tag} from '../../../device/device.type';

@Injectable()
export class TagVisibilityTogglerService {
  private tagSet: Subject<Tag[]> = new Subject<Tag[]>();
  private tagToggled: Subject<TagToggle> = new Subject<TagToggle>();

  setTags(tags: Tag[]): void {
    this.tagSet.next(tags);
  }

  onTagSet(): Observable<Tag[]> {
    return this.tagSet.asObservable();
  }

  toggleTag(tagToggle: TagToggle): void {
    this.tagToggled.next(tagToggle);
  }

  onToggleTag(): Observable<TagToggle> {
    return this.tagToggled.asObservable();
  }
}

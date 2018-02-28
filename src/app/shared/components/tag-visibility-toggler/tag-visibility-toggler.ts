import {Component, OnDestroy, OnInit} from '@angular/core';
import {TagVisibilityTogglerService} from './tag-visibility-toggler.service';
import {Subscription} from 'rxjs/Subscription';
import {Tag} from '../../../device/device.type';

@Component({
  selector: 'app-tag-visibility-toggler',
  templateUrl: './tag-visibility-toggler.html',
  styleUrls: ['./tag-visibility-toggler.css']
})
export class TagVisibilityTogglerComponent implements OnInit, OnDestroy {
  selectedTags: Tag[];
  tags: Tag[];
  private tagSetSubscription: Subscription;

  constructor(private tagVisibilityTogglerService: TagVisibilityTogglerService) {
  }

  ngOnInit(): void {
    this.tagSetSubscription = this.tagVisibilityTogglerService.onTagSet().subscribe((tags: Tag[]) => {
      this.selectedTags = tags;
      this.tags = tags;
    });
  }

  ngOnDestroy(): void {
    if (!!this.tagSetSubscription) {
      this.tagSetSubscription.unsubscribe();
    }
  }

  onChange(selected: boolean, tag: Tag): void {
    this.tagVisibilityTogglerService.toggleTag({
      tag: tag,
      selected: selected
    });
  }
}
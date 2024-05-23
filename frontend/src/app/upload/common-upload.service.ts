import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonUploadService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly allPackages$ = new Subject<string>();

  constructor() {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  allPackages(link: string) {
    this.allPackages$.next(link);
  }
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Script } from 'src/app/typing';
import { ScriptListService } from './script-list.service';

@Component({
  selector: 'app-script-list',
  templateUrl: './script-list.component.html',
  styleUrls: ['./script-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScriptListComponent implements OnInit, OnDestroy {
  scripts$ = new BehaviorSubject<Script[]>([]);

  deleteScriptIds: number[] = [];

  count: number;
  pageSize: number;
  pageIndex: number;
  pageSizeOptions = [10, 30, 60];

  private unsubscriber$ = new Subject<void>();

  constructor(
    private scriptListService: ScriptListService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.scriptListService
      .getScripts()
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe((paginationResult) => {
        this.scripts$.next(paginationResult.data);
        this.count = paginationResult.count;
        this.pageIndex = paginationResult.pageIndex;
        this.pageSize = paginationResult.pageSize;

        this.cd.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
  }

  checkScript(event, scriptId: number): void {
    if (event.target.checked) {
      this.deleteScriptIds.push(scriptId);
    } else {
      this.deleteScriptIds = this.deleteScriptIds.filter(
        (id) => id !== scriptId
      );
    }
  }

  newScript(): void {
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  deleteScripts(): void {
    if (this.deleteScriptIds.length === 0) {
      return;
    }
    this.scriptListService
      .deleteScripts(this.deleteScriptIds)
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(() => {
        const scripts = this.scripts$
          .getValue()
          .filter((script) => !this.deleteScriptIds.includes(script.id));
        this.scripts$.next(scripts);
        this.deleteScriptIds = [];
        this.cd.markForCheck();
      });
  }

  handlePageEvent(pageEvent: PageEvent): void {
    this.scriptListService
      .getScripts(pageEvent.pageIndex, pageEvent.pageSize)
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe((paginationResult) => {
        this.scripts$.next(paginationResult.data);
        this.count = paginationResult.count;
        this.pageIndex = paginationResult.pageIndex;
        this.pageSize = paginationResult.pageSize;

        this.cd.markForCheck();
      });
  }
}

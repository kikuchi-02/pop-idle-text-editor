import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-warning-ballon',
  templateUrl: './warning-ballon.component.html',
  styleUrls: ['./warning-ballon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarningBallonComponent implements OnInit, OnDestroy {
  @HostBinding('style.top') top: string;
  @HostBinding('style.left') left: string;
  @HostBinding('style.display') display = 'none';

  @Input() messenger$: Subject<void>;
  @Output() warningChange = new EventEmitter<{
    uuid: string;
    num?: string;
    unknown?: string;
  }>();

  darkTheme = false;

  private unsubscriber$ = new Subject<void>();

  activeWarning: { uuid: string; num?: string; unknown?: string };

  constructor(
    private cd: ChangeDetectorRef,
    private elementRef: ElementRef,
    private appService: AppService
  ) {
    this.appService.darkTheme$
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe((val) => {
        this.darkTheme = val;
        this.cd.markForCheck();
      });
  }

  ngOnInit(): void {
    this.messenger$
      .pipe(
        switchMap(() => this.watchWarningElement()),
        takeUntil(this.unsubscriber$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
  }

  watchWarningElement(): Observable<MouseEvent> {
    const warningSelectors = this.elementRef.nativeElement
      .closest('app-subtitle')
      .querySelectorAll('[data-warning-uuid]');

    return merge(
      ...[...warningSelectors].map((elm) => fromEvent(elm, 'click'))
    ).pipe(
      tap((event: PointerEvent) => {
        const target = event.target;
        const uuid = (target as HTMLElement)?.getAttribute('data-warning-uuid');
        if (!uuid) {
          return;
        }
        const num = (target as HTMLElement)?.getAttribute('data-warning-num');
        const unknown = (target as HTMLElement)?.getAttribute(
          'data-warning-unknown'
        );
        if (!num && !unknown) {
          return;
        }

        this.activeWarning = { uuid, num, unknown };
        const rect = (target as HTMLElement)?.getBoundingClientRect();
        const offset = 50;
        this.top = rect.top + window.pageYOffset - offset + 'px';
        this.left = rect.left + 'px';
        this.display = 'block';
        this.cd.markForCheck();
      })
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.activeWarning) {
      return;
    }
    const isInnerClick = (event.target as HTMLElement)?.closest(
      'app-warning-ballon'
    );
    if (isInnerClick) {
      return;
    }
    const isOtherWarning = (event.target as HTMLElement)?.closest(
      '[data-warning-uuid]'
    );
    if (isOtherWarning) {
      return;
    }
    this.activeWarning = undefined;
    this.display = 'none';
    this.cd.markForCheck();
  }

  addDictionary(): void {
    this.warningChange.emit({
      uuid: this.activeWarning.uuid,
      unknown: this.activeWarning.unknown,
    });
  }

  format(type: 0 | 1): void {
    try {
      const parsed = parseInt(this.activeWarning.num, 10);

      let num: string;
      if (type === 0) {
        num = this.number2String(parsed);
      } else {
        num = parsed.toString();
      }
      this.warningChange.emit({ uuid: this.activeWarning.uuid, num });
    } catch (e) {
      return;
    }
  }

  private number2String(value: number): string {
    const numberString = value.toString();
    let str = '';
    for (let i = 0; i < numberString.length; i++) {
      const char = numberString.charAt(i);
      if (char === '.') {
        str += '??????';
      } else {
        str += this.number2Ja(parseInt(char, 10));
      }
    }
    return str;
  }

  private number2String2(value: number): string {
    let str = '';
    let digitCounter = 0;
    while (value > 0) {
      const remainder = value % 10;
      const numberOfDigit = this.number2Ja(remainder);
      const digitUnder1e4 = this.logBase10(digitCounter % 4, remainder);
      const bigDigit = this.logBase10(digitCounter, remainder);

      let numberString: string;
      if (remainder === 0) {
        numberString = '';
      } else if (remainder === 1) {
        if (digitCounter === 0) {
          numberString = numberOfDigit;
        } else if (digitCounter % 4 === 0) {
          numberString = '';
        } else {
          numberString = digitUnder1e4;
        }
      } else {
        if (digitCounter % 4 === 0) {
          numberString = numberOfDigit;
        } else {
          numberString = numberOfDigit + digitUnder1e4;
        }
      }

      if (digitCounter % 4 === 0 && digitCounter > 0) {
        numberString += bigDigit;
      }

      str = numberString + str;
      value = Math.floor(value / 10);
      digitCounter++;
    }
    return str;
  }

  private number2Ja(value: number): string {
    switch (value) {
      case 0:
        return '??????';
      case 1:
        return '??????';
      case 2:
        return '???';
      case 3:
        return '??????';
      case 4:
        return '??????';
      case 5:
        return '???';
      case 6:
        return '??????';
      case 7:
        return '??????';
      case 8:
        return '??????';
      case 9:
        return '?????????';
    }
  }
  private logBase10(value: number, numberOfDigits: number): string {
    /*
    http://www.suguru.jp/learn/big.html
    */
    switch (value) {
      case 1:
        return '?????????';
      case 2:
        if ([3].includes(numberOfDigits)) {
          return '?????????';
        } else if ([6, 8].includes(numberOfDigits)) {
          return '?????????';
        }
        return '?????????';
      case 3:
        if ([3].includes(numberOfDigits)) {
          return '??????';
        }
        return '??????';
      case 4:
        return '??????';
      case 8:
        return '??????';
      case 12:
        return '?????????';
      case 16:
        return '??????';
      case 20:
        return '??????';
      case 24:
        return '???';
      case 28:
        return '?????????';
      case 32:
        return '??????';
      case 36:
        return '??????';
      case 40:
        return '??????';
      case 44:
        return '??????';
      case 48:
        return '??????';
      case 52:
        return '???????????????';
      case 56:
        return '????????????';
      case 60:
        return '?????????';
      case 64:
        return '????????????';
      case 68:
        return '????????????????????????';
    }
  }
}

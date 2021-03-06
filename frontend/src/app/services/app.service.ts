import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  interval,
  Observable,
  Subscriber,
  throwError,
} from 'rxjs';
import { distinctUntilChanged, filter, first, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';
import { WebsocketProvider } from 'y-websocket';
import { Doc } from 'yjs';
import { availableFonts, Font } from '../typing';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  public ydoc = new Doc();
  public wsProvider: WebsocketProvider;

  private darkThemeSubject$ = new BehaviorSubject<boolean>(false);
  public darkTheme$ = this.darkThemeSubject$.asObservable();

  private loadingSubject$ = new BehaviorSubject<boolean>(false);
  private loadingHashSet = new Set<string>();
  public loading$ = this.loadingSubject$.pipe(distinctUntilChanged());

  get useWs(): boolean {
    return environment.USE_WS;
  }

  private fontKey = 'app-font-key';
  private currentFont: Font;
  get font(): Font {
    if (this.currentFont) {
      return this.currentFont;
    }
    const value = localStorage.getItem(this.fontKey) as Font;
    if (value && availableFonts.includes(value)) {
      this.currentFont = value;
      return value;
    }
    this.currentFont = 'Meiryo';
    return this.currentFont;
  }

  set font(value: Font) {
    if (value !== this.currentFont) {
      this.currentFont = value;
      localStorage.setItem(this.fontKey, this.currentFont);
    }
  }

  private subtitleWidthKey = 'app-subtitle-key';
  private currentWidth: number;
  get subtitleWidth(): number {
    if (this.currentWidth) {
      return this.currentWidth;
    }
    const value = parseInt(localStorage.getItem(this.subtitleWidthKey), 10);
    if (value >= 0 && value <= 100) {
      this.currentWidth = value;
      return value;
    }
    this.currentWidth = 50;
    return this.currentWidth;
  }
  set subtitleWidth(value: number) {
    if (value !== this.currentWidth) {
      this.currentWidth = value;
      localStorage.setItem(this.subtitleWidthKey, String(value));
    }
  }

  constructor() {}

  wsReconnect(): void {
    if (this.useWs && (!this.wsProvider || !this.wsProvider.wsconnected)) {
      this.wsProvider = new WebsocketProvider(
        `${environment.production ? 'wss' : 'ws'}://${window.location.host}`,
        '__text',
        this.ydoc
      );
    }
  }

  wsSynced(): Observable<void> {
    if (!this.useWs) {
      return throwError('ws is off');
    }
    // return new Observable((subscriber: Subscriber<void>) => {
    //   if (this.wsProvider.synced) {
    //     subscriber.next();
    //     subscriber.complete();
    //   } else {
    //     this.wsProvider.once('wsSynced', (isSynced: boolean) => {
    //       if (isSynced) {
    //         subscriber.next();
    //         subscriber.complete();
    //       }
    //     });
    //   }
    // });
    return new Observable((subscriber: Subscriber<void>) => {
      if (this.wsProvider.synced) {
        subscriber.next();
        subscriber.complete();
      } else {
        interval(100)
          .pipe(
            filter(() => this.wsProvider.synced),
            map(() => void 0),
            first()
          )
          .subscribe(subscriber);
      }
    });
  }

  setTheme(darkTheme: boolean): void {
    this.darkThemeSubject$.next(darkTheme);
  }

  setLoading(): string {
    const uuid = uuidv4();
    this.loadingHashSet.add(uuid);
    this.loadingSubject$.next(true);
    return uuid;
  }

  resolveLoading(uuid: string): void {
    this.loadingHashSet.delete(uuid);
    if (this.loadingHashSet.size === 0) {
      this.loadingSubject$.next(false);
    }
  }
}

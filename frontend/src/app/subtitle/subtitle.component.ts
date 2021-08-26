import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import Quill from 'quill';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { SubtitleService } from './subtitle.service';

interface Srt {
  duration: number;
  text: string;
}

const layouts = ['sound', 'tag', 'srt', 'link'] as const;
type Layout = typeof layouts[number];

@Component({
  selector: 'app-subtitle',
  templateUrl: './subtitle.component.html',
  styleUrls: ['./subtitle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubtitleComponent implements OnInit, OnDestroy {
  public static subtitleLocalStorageKey = 'subtitleLocalStorageKey';

  loading = true;

  layout: Layout = 'sound';
  dictionaryOpen = false;

  warningMessenger$ = new Subject<void>();
  newDictionaryKeys: string[] = [];

  showSubtitleLine = true;

  private unsubscriber$ = new Subject<void>();
  private warningUnsubscriber$ = new Subject<void>();
  private inputEditor: Quill;
  private outputEditor: Quill;

  constructor(
    private cd: ChangeDetectorRef,
    private subtitleService: SubtitleService,
    private ngZone: NgZone,
    private renderer: Renderer2
  ) {}

  onEditorCreated(event: Quill, type: 'input' | 'output'): void {
    if (type === 'input') {
      this.inputEditor = event;
    } else if (type === 'output') {
      this.outputEditor = event;
    }
    this.refreshInput();
    this.loading = false;
    this.cd.markForCheck();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.unsubscriber$.next();
  }

  convertSound(): void {
    this.loading = true;
    const input = this.inputEditor.getText();
    localStorage.setItem(SubtitleComponent.subtitleLocalStorageKey, input);
    this.subtitleService
      .textToSoundText(input)
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe((result) => {
        Object.values(result.inputUnknownIndexes).forEach(({ start, end }) => {
          this.inputEditor.formatText(
            start,
            end - start,
            'background-color',
            'orange'
          );
        });
        this.outputEditor.setText(result.text);
        const outputText = this.outputEditor.getText();
        Object.values(result.outputUnknownIndexes).forEach(({ start, end }) => {
          const uuid = uuidv4();
          const unknown = outputText.substring(start, end);
          this.outputEditor.formatText(start, end - start, 'warning', {
            uuid,
            unknown,
          });
        });
        result.outputWarningIndexes.forEach(({ start, end }) => {
          const uuid = uuidv4();
          const num = parseInt(outputText.substring(start, end), 10);
          this.outputEditor.formatText(start, end - start, 'warning', {
            uuid,
            num,
          });
        });
        this.loading = false;
        this.cd.markForCheck();

        this.ngZone.onStable
          .pipe(
            first(),
            takeUntil(this.warningUnsubscriber$),
            takeUntil(this.unsubscriber$)
          )
          .subscribe(() => {
            this.warningMessenger$.next();
          });
      });
  }

  extractTags(): void {
    this.loading = true;
    const input = this.inputEditor.getText();
    this.subtitleService
      .extractTags(input)
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe((tags) => {
        const text = tags.map((tag) => `#${tag}`).join(' ');
        this.outputEditor.setText(text);
        this.loading = false;
        this.cd.markForCheck();
      });
  }

  applyLayout(type: Layout): void {
    if (!layouts.includes(type)) {
      return;
    }
    this.layout = type;
    this.refreshOutput();

    this.cd.markForCheck();
  }

  warningChange(event: { uuid: string; num?: string; unknown?: string }): void {
    if (event.num) {
      const delta = this.outputEditor.getContents();
      delta.ops = delta.ops.map((op) => {
        if (op.attributes?.warning?.uuid !== event.uuid) {
          return op;
        }
        op.insert = event.num;
        return op;
      });
      this.outputEditor.setContents(delta);
      this.warningMessenger$.next();
    }
    if (event.unknown) {
      this.newDictionaryKeys = [event.unknown];
      this.dictionaryOpen = true;
    }
    this.cd.markForCheck();
  }

  download(): void {
    const content = this.outputEditor.getText();

    let filename: string;
    switch (this.layout) {
      case 'srt':
        filename = `subtitle.srt`;
        break;
      default:
        filename = `${this.layout}.txt`;
    }

    const anchor = this.renderer.createElement('a');
    this.renderer.setStyle(anchor, 'display', 'none');
    const blob = new Blob([content], { type: 'octet/stream' });
    const url = window.URL.createObjectURL(blob);
    this.renderer.setAttribute(anchor, 'href', url);
    this.renderer.setAttribute(anchor, 'download', filename);
    this.renderer.appendChild(document.body, anchor);

    anchor.click();
    window.URL.revokeObjectURL(url);
    this.renderer.removeChild(document.body, anchor);
  }

  subtitleToSrt(): void {
    this.loading = true;
    const input = this.inputEditor
      .getText()
      .trim()
      .replace(/（[^）]*）/g, '')
      .replace(/\d\n/g, '\n')
      .replace(/☆/g, '')
      .replace(/【(.*)】/g, (match, p1, offset, str) => p1 + '\n');

    this.subtitleService
      .splitByNewLine(input)
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe((splittedText) => {
        this.inputEditor.setText(splittedText);

        const firstAt = 10005;
        const partials: Srt[] = [];
        let last: string;
        let seqCounter = 0;
        let textIndex = 0;
        let error = false;

        const splitted = splittedText.split('\n');
        for (const text of splitted) {
          seqCounter++;
          if (text !== '' && text !== '。') {
            if (seqCounter > 2) {
              error = true;
              this.inputEditor.formatText(
                textIndex,
                text.length,
                'background-color',
                '#FFAF7A'
              );
            }
            if (last !== undefined) {
              partials.push(this.calcSrt(last, text));
              last = undefined;
            } else {
              last = text;
            }
          } else {
            seqCounter = 0;
            if (last !== undefined) {
              partials.push(this.calcSrt(last));
              last = undefined;
            }
          }
          // length plus new line character
          textIndex += text.length + 1;
        }
        if (last !== undefined) {
          partials.push(this.calcSrt(last));
        }

        if (error) {
          this.outputEditor.setText(
            'The sentence continues for more than three lines.'
          );
          this.loading = false;
          this.cd.markForCheck();
          return;
        }

        let result = '';
        let lastTime: number;
        for (let i = 0; i < partials.length; i++) {
          const srt = partials[i];
          const start = lastTime === undefined ? firstAt : lastTime;
          const end = start + srt.duration;

          const startS = String(Math.ceil(start));
          const endS = String(Math.ceil(end));

          const block =
            `${i + 1}\n` +
            `${('00' + startS.slice(undefined, -4)).slice(-2)}:${(
              '00' + startS.slice(-4, -2)
            ).slice(-2)}:${('00' + startS.slice(-2)).slice(-2)},000` +
            ' --> ' +
            `${('00' + endS.slice(undefined, -4)).slice(-2)}:${(
              '00' + endS.slice(-4, -2)
            ).slice(-2)}:${('00' + endS.slice(-2)).slice(-2)},000` +
            '\n' +
            `${srt.text}` +
            '\n\n';

          result += block;
          lastTime = end;
        }
        this.outputEditor.setText(result);
        this.loading = false;
        this.cd.markForCheck();
      });
  }

  extractLinks(): void {
    const str = this.inputEditor.getText().trim();
    const regexp = new RegExp(/(https?:\/\/[^\s|\)|\]]+)/, 'g');
    let match;

    const urlSet = new Set();

    while ((match = regexp.exec(str)) !== null) {
      urlSet.add(match[0]);
    }

    const result = '参考\n' + [...urlSet].sort().join('\n');

    this.outputEditor.setText(result);
  }

  refreshInput(): void {
    const input = localStorage.getItem(
      SubtitleComponent.subtitleLocalStorageKey
    );
    this.inputEditor.setText(input || '');
  }

  refreshOutput(): void {
    switch (this.layout) {
      case 'sound':
        this.convertSound();
        break;
      case 'tag':
        this.extractTags();
        break;
      case 'srt':
        this.subtitleToSrt();
        break;
      case 'link':
        this.extractLinks();
        break;
      default:
        throw new Error(`not implemented this type ${this.layout}`);
    }
  }

  private calcSrt(text1: string, text2?: string): Srt {
    const baseTime = 7.5;
    const maxLength = 30;

    let duration: number;
    let text: string;

    if (!text2) {
      duration = (text1.length / maxLength) * baseTime;
      text = `<b>${text1}</b>`;
      return { duration, text };
    }
    duration = Math.ceil(
      ((text1.length + text2.length) / maxLength) * baseTime
    );
    text = `<b>${text1}</b>\n<b>${text2}</b>`;
    return { duration, text };
  }
}

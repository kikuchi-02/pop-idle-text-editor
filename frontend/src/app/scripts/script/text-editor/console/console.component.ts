import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/services/app.service';
import { ScriptService } from '../../script.service';
import {
  EditorService,
  TextLintMessageWithUuid,
  TextlintResultWithUUid,
} from '../editor.service';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsoleComponent implements OnInit, OnDestroy {
  private unsubscriber$ = new Subject<void>();

  textLintErrors: TextLintMessageWithUuid[];
  textLintRaisedError = false;

  @Input() darkTheme: boolean;

  constructor(
    private appService: AppService,
    private scriptService: ScriptService,
    private cd: ChangeDetectorRef,
    private editorService: EditorService
  ) {}

  ngOnInit(): void {
    this.editorService.initialized$
      .pipe(first(), takeUntil(this.unsubscriber$))
      .subscribe(() => {
        this.textLint();
      });
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
  }

  textLint(): void {
    const text = this.editorService.getText();
    if (!text) {
      return;
    }
    this.removeOldLint();

    const uuid = this.appService.setLoading();
    this.scriptService
      .textLint(text)
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(
        (result: TextlintResultWithUUid) => {
          const formatted = this.editorService.applyTextLintResult(result);
          this.textLintErrors = formatted.messages;
          this.cd.markForCheck();
          this.appService.resolveLoading(uuid);
        },
        (err) => {
          this.textLintRaisedError = true;
          this.textLintErrors = undefined;
          this.cd.markForCheck();
          this.appService.resolveLoading(uuid);
        }
      );
  }

  removeOldLint(): void {
    this.editorService.removeTextLintResult();
  }

  onClickMessage(message: TextLintMessageWithUuid): void {
    this.editorService.focusTextLintMessage(message);
  }
}

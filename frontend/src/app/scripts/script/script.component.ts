import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ContentChange,
  QuillEditorComponent,
  SelectionChange,
} from 'ngx-quill';
import { Quill } from 'quill';
import { fromEvent, ReplaySubject, Subject } from 'rxjs';
import { debounceTime, first, mergeMap, takeUntil } from 'rxjs/operators';
import { SubtitleComponent } from 'src/app/subtitle/subtitle.component';
import { Script } from 'src/app/typing';
import { ScriptService } from './script.service';
import { BalloonComponent } from './text-editor/balloon/balloon.component';
import { EditorService } from './text-editor/editor.service';

@Component({
  selector: 'app-script',
  templateUrl: './script.component.html',
  styleUrls: ['./script.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EditorService],
})
export class ScriptComponent implements OnInit, OnDestroy, AfterViewInit {
  initialScript: Script;
  script: Script;
  blurred = false;
  focused = false;

  showSubtitleLine = true;
  loading = false;

  titleFormControl = new FormControl('', [Validators.required]);

  @ViewChild(BalloonComponent)
  balloonComponent: BalloonComponent;
  @ViewChild(QuillEditorComponent) editor: QuillEditorComponent;

  consolePositionTop = 0;

  private initialized$ = new ReplaySubject<void>(1);
  private unsubscriber$ = new Subject<void>();

  private autoSave$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
    private scriptService: ScriptService,
    private renderer: Renderer2,
    private editorService: EditorService,
    private elementRef: ElementRef
  ) {
    const params = this.route.snapshot.paramMap;
    const id = params.get('id');
    if (id === 'new') {
      this.script = new Script();
      this.initialScript = new Script();
      this.cd.markForCheck();
      this.initialized$.next();
    } else {
      this.scriptService
        .getScript(parseInt(id, 10))
        .pipe(takeUntil(this.unsubscriber$))
        .subscribe((script) => {
          this.script = script;
          this.initialScript = this.script.clone();
          this.titleFormControl.setValue(this.script.title);
          this.cd.markForCheck();
          this.initialized$.next();
        });
    }

    this.initialized$
      .pipe(
        mergeMap(() => this.autoSave$),
        debounceTime(1000 * 30),
        takeUntil(this.unsubscriber$)
      )
      .subscribe(() => {
        this.save();
      });
  }

  onEditorCreated(editor: Quill): void {
    this.initialized$
      .pipe(first(), takeUntil(this.unsubscriber$))
      .subscribe(() => {
        const content = editor.getContents();
        content.ops = this.script.deltaOps;
        editor.setContents(content);
        this.editorService.initialize(this.script.id, editor);
      });
  }

  onContentChanged(event: ContentChange): void {
    this.editorService.onContentChanged(event);
    this.autoSave$.next();
  }

  onSelectionChanged(event: SelectionChange): void {
    this.editorService.onSelectionChange(event);
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.unsubscriber$.next();
  }

  ngAfterViewInit(): void {
    this.initialized$
      .pipe(first(), takeUntil(this.unsubscriber$))
      .subscribe(async () => {
        this.cd.detectChanges();

        this.registerEditorEventListener();

        this.consolePositionTop = document
          .querySelector('.tool-box__wrapper')
          .getBoundingClientRect().height;
      });
  }

  canDeactivate(): boolean {
    this.script.deltaOps = this.editorService.getDelta();
    if (this.script.isEqual(this.initialScript)) {
      return true;
    }
    return window.confirm(
      'Are you sure you want to leave this page before you save this script'
    );
  }

  save(): void {
    this.script.title = this.titleFormControl.value;
    this.script.deltaOps = this.editorService.getDelta();
    if (this.script.deltaOps.length === 0 || !this.script.title) {
      return;
    }
    if (this.script.isEqual(this.initialScript)) {
      return;
    }

    if (this.script.id) {
      this.scriptService
        .putScript(this.script)
        .pipe(takeUntil(this.unsubscriber$))
        .subscribe((script) => {
          this.script = script;
          this.initialScript = script.clone();
          this.cd.markForCheck();
        });
    } else {
      this.scriptService
        .postScript(this.script)
        .pipe(takeUntil(this.unsubscriber$))
        .subscribe((script) => {
          this.script = script;
          this.initialScript = script.clone();
          this.cd.markForCheck();

          this.router.navigate([`../${script.id}`], { relativeTo: this.route });
        });
    }
  }

  copy2Clipboard(): void {
    const div = this.renderer.createElement('div');
    div.innerHTML = this.script.deltaOps.map((delta) => delta.insert).join('');

    const elm = document.createElement('textarea');
    elm.value = this.editorService.getText();
    document.body.appendChild(elm);
    elm.select();
    elm.setSelectionRange(0, 9999);
    document.execCommand('copy');
    document.body.removeChild(elm);
  }

  deleteScript(): void {
    if (window.confirm('Are you sure you want to delete')) {
      this.scriptService
        .deleteScript(this.script.id)
        .pipe(takeUntil(this.unsubscriber$))
        .subscribe(() => {
          this.router.navigate(['../'], { relativeTo: this.route });
        });
    }
  }

  scrollTop(): void {
    window.scroll({ top: 0, behavior: 'smooth' });
  }

  navigateSubtitle(): void {
    const div = this.renderer.createElement('div');
    div.innerHTML = this.script.deltaOps.map((delta) => delta.insert).join('');

    const textContent = this.editorService.getText();

    const subtitleKey = SubtitleComponent.subtitleLocalStorageKey;
    localStorage.setItem(subtitleKey, textContent);
    this.router.navigate(['/subtitle']);
  }

  private registerEditorEventListener(): void {
    fromEvent(this.editor.elementRef.nativeElement, 'mouseup')
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe((event: MouseEvent) => {
        this.balloonComponent.selectionChange(event);

        const commentedElement = (event.target as any).closest('[data-uuid]');
        if (commentedElement) {
          const uuid = commentedElement.getAttribute('data-uuid');
          this.editorService.focusChatMessage(uuid);
        }
      });

    fromEvent(this.editor.elementRef.nativeElement, 'keydown')
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe((event: KeyboardEvent) => {
        if (event.ctrlKey) {
          switch (event.key) {
            case 'z':
              if (event.shiftKey) {
                this.editorService.undo();
              } else {
                this.editorService.redo();
              }
              event.preventDefault();
              break;
            case 's':
              this.autoSave$.next();
              this.save();
              event.preventDefault();
          }
        }
      });

    this.editorService.commentFocused$
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe((uuid) => {
        const targetElm = this.elementRef.nativeElement.querySelector(
          `[data-uuid="${uuid}"]`
        );
        if (targetElm) {
          const rect = targetElm.getBoundingClientRect();
          const offset = 300;

          const y = rect.y + window.scrollY - offset;
          window.scroll({
            top: y > offset ? 0 : y,
            behavior: 'smooth',
          });
        }
      });
  }

  // @HostListener('paste', ['$event'])
  // preventFormattedPast(event: ClipboardEvent): void {
  //   event.preventDefault();
  //   const { clipboardData } = event;
  //   const text =
  //     clipboardData.getData('text/plain') || clipboardData.getData('text');
  //   // const html = clipboardData.getData('html');
  //   // const delta = this.editor.quillEditor.clipboard.convert(html);
  //   this.editor.quillEditor.clipboard.dangerouslyPasteHTML(text);
  //   // debugger;
  //   // document.execCommand('insertText', false, text);
  // }
}

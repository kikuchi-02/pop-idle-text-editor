import {
  MAT_COLOR_FORMATS,
  NgxMatColorPickerModule,
  NGX_MAT_COLOR_FORMATS,
} from '@angular-material-components/color-picker';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { QuillModule } from 'ngx-quill';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import { SharedModule } from '../shared/shared.module';
import { ScriptListComponent } from './script-list/script-list.component';
import { ScriptComponent } from './script/script.component';
import { BalloonComponent } from './script/text-editor/balloon/balloon.component';
import { ChatComponent } from './script/text-editor/chat/chat.component';
import { ConsoleComponent } from './script/text-editor/console/console.component';
import { EditableDirective } from './script/text-editor/editable.directive';
import { ToolBoxComponent } from './script/text-editor/tool-box/tool-box.component';
import { ScriptsRoutingModule } from './scripts-routing.module';

Quill.register('modules/cursors', QuillCursors);

@NgModule({
  declarations: [
    ConsoleComponent,
    ToolBoxComponent,
    BalloonComponent,
    EditableDirective,
    ScriptComponent,
    ScriptListComponent,
    ChatComponent,
  ],
  imports: [
    CommonModule,
    NgxMatColorPickerModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule,
    ScriptsRoutingModule,
    MatButtonModule,
    MatTabsModule,
    SharedModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSelectModule,
    QuillModule.forRoot({
      modules: {
        cursors: true,
      },
    }),
  ],
  providers: [{ provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS }],
})
export class ScriptsModule {}

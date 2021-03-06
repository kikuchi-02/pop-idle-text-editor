import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PendingChangesGuard } from '../guards/pending-changes.guard';
import { ScriptListComponent } from './script-list/script-list.component';
import { ScriptComponent } from './script/script.component';

const routes: Routes = [
  { path: '', component: ScriptListComponent },
  {
    path: ':id',
    component: ScriptComponent,
    canDeactivate: [PendingChangesGuard],
  },
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class ScriptsRoutingModule {}

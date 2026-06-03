import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DockingService, DockingSubmitPayload } from '../services/docking.service';
import { TargetService, Target } from '../services/target.service';
import { QueryService, QueryDB, CompoundInfo } from '../services/query.service';
import { AuthService } from '../services/auth.service';

interface CompoundOption {
  id: string;
  path: string;
  name: string;
  selected: boolean;
}

@Component({
  standalone: true,
  selector: 'app-new-docking',
  imports: [CommonModule, FormsModule],
  templateUrl: './new-docking.component.html',
  styleUrls: ['./new-docking.component.css']
})
export class NewDockingComponent implements OnInit {
  private dockingService = inject(DockingService);
  private targetService = inject(TargetService);
  private queryService = inject(QueryService);
  private auth = inject(AuthService);

  // Targets (selección múltiple)
  userTargets: Target[] = [];
  selectedTargetIds: string[] = [];

  // Queries (selección única)
  userQueries: QueryDB[] = [];
  selectedQueryId: string = '';

  // Compuestos de la query seleccionada
  availableCompounds: CompoundOption[] = [];
  filterText: string = '';

  // Nombre opcional
  dockingName: string = '';

  loading = false;
  resultMessage = '';
  resultType: 'success' | 'error' = 'success';

  ngOnInit() {
    this.loadInitialData();
  }

  async loadInitialData() {
    const user = this.auth.getEmail();
    if (!user) return;
    try {
      const [targets, queries] = await Promise.all([
        this.targetService.getUserTargets(user),
        this.queryService.getUserQueries(user)
      ]);
      this.userTargets = targets;
      this.userQueries = queries;
    } catch (err) {
      console.error('Error loading initial data', err);
    }
  }

  // Al seleccionar una query (radio)
  async onQuerySelected(queryId: string) {
    this.selectedQueryId = queryId;
    await this.loadCompoundsForQuery(queryId);
  }

  async loadCompoundsForQuery(queryId: string) {
    if (!queryId) {
      this.availableCompounds = [];
      return;
    }
    try {
      const compounds: CompoundInfo[] = await this.queryService.getCompoundsByQueryId(queryId);
      this.availableCompounds = compounds.map(comp => ({
        id: comp.id,
        path: comp.path,
        name: comp.path.split(/[\\/]/).pop() || comp.id,
        selected: false
      }));
      this.filterText = '';
    } catch (err) {
      console.error('Error loading compounds', err);
      this.availableCompounds = [];
    }
  }

  get filteredCompounds() {
    if (!this.filterText) return this.availableCompounds;
    return this.availableCompounds.filter(c =>
      c.name.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }

  selectAllCompounds() {
    this.availableCompounds.forEach(c => c.selected = true);
  }

  deselectAllCompounds() {
    this.availableCompounds.forEach(c => c.selected = false);
  }

  onTargetToggle(targetId: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedTargetIds.push(targetId);
    } else {
      const idx = this.selectedTargetIds.indexOf(targetId);
      if (idx !== -1) this.selectedTargetIds.splice(idx, 1);
    }
  }

  async onSubmit() {
    // Validaciones
    if (this.selectedTargetIds.length === 0) {
      this.resultMessage = 'Please select at least one target.';
      this.resultType = 'error';
      return;
    }
    if (!this.selectedQueryId) {
      this.resultMessage = 'Please select a query.';
      this.resultType = 'error';
      return;
    }
    const selectedCompounds = this.availableCompounds.filter(c => c.selected);
    if (selectedCompounds.length === 0) {
      this.resultMessage = 'Please select at least one compound.';
      this.resultType = 'error';
      return;
    }

    const user = this.auth.getEmail();
    if (!user) return;

    this.loading = true;
    this.resultMessage = '';

    const jobsCreated: string[] = [];
    const errors: string[] = [];

    for (const targetId of this.selectedTargetIds) {
      const target = this.userTargets.find(t => t._id === targetId);
      if (!target) continue;

      const payload: DockingSubmitPayload = {
        user: user,
        target_path: target.pdbqt_path,
        box_config_path: target.config_path,
        compounds: selectedCompounds.map(c => ({ id: c.id, path: c.path })),
        name: this.dockingName || undefined
        // sin description
      };

      try {
        const response = await this.dockingService.submitDocking(payload);
        jobsCreated.push(response.job_id);
      } catch (err: any) {
        console.error(`Error submitting docking for target ${target.name}`, err);
        errors.push(target.name);
      }
    }

    this.loading = false;

    if (jobsCreated.length > 0) {
      this.resultMessage = `✅ Docking submitted. Created ${jobsCreated.length} job(s): ${jobsCreated.join(', ')}`;
      this.resultType = 'success';
      // Resetear formulario
      this.selectedTargetIds = [];
      this.selectedQueryId = '';
      this.availableCompounds = [];
      this.dockingName = '';
    } else {
      this.resultMessage = '❌ No jobs were created. Please check the errors.';
      this.resultType = 'error';
    }
  }
}
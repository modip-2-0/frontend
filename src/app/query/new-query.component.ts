import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QueryService, QueryDB, CompoundInfo } from '../services/query.service';
import { TargetService, Target } from '../services/target.service';
import { AuthService } from '../services/auth.service';
import { DockingService, DockingSubmitPayload } from '../services/docking.service';

@Component({
  standalone: true,
  selector: 'app-new-query',
  imports: [CommonModule, FormsModule],
  templateUrl: './new-query.component.html',
  styleUrls: ['./new-query.component.css']
})
export class NewQueryComponent implements OnInit {
  private queryService = inject(QueryService);
  private targetService = inject(TargetService);
  private auth = inject(AuthService);
  private dockingService = inject(DockingService);

  queryText = '';
  selectedTargetIds: string[] = [];
  autoDock = false;
  loading = false;
  resultMessage = '';
  resultType: 'success' | 'error' = 'success';

  userTargets: Target[] = [];

  ngOnInit() {
    this.loadTargets();
  }

  async loadTargets() {
    const user = this.auth.getEmail();
    if (!user) return;
    try {
      this.userTargets = await this.targetService.getUserTargets(user);
    } catch (err) {
      console.error(err);
    }
  }

  onTargetSelection(event: any, targetId: string) {
    if (event.target.checked) {
      this.selectedTargetIds.push(targetId);
    } else {
      const index = this.selectedTargetIds.indexOf(targetId);
      if (index !== -1) this.selectedTargetIds.splice(index, 1);
    }
  }

  // Espera a que los compuestos estén disponibles (polling)
  private async waitForCompounds(queryId: string, maxAttempts = 30, intervalMs = 2000): Promise<CompoundInfo[]> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const compounds = await this.queryService.getCompoundsByQueryId(queryId);
        if (compounds.length > 0) {
          console.log(`Compounds ready after ${attempt + 1} attempts`);
          return compounds;
        }
      } catch (err) {
        console.warn(`Error polling compounds for query ${queryId}:`, err);
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    console.error(`Timeout waiting for compounds for query ${queryId}`);
    return [];
  }

  async onSubmit() {
    if (!this.queryText.trim()) {
      this.resultMessage = 'Please enter a query.';
      this.resultType = 'error';
      return;
    }
    if (this.selectedTargetIds.length === 0) {
      this.resultMessage = 'Please select at least one target.';
      this.resultType = 'error';
      return;
    }

    const user = this.auth.getEmail();
    if (!user) {
      this.resultMessage = 'User not logged in.';
      this.resultType = 'error';
      return;
    }

    this.loading = true;
    this.resultMessage = '';

    try {
      // 1. Crear la query (el backend devuelve el objeto completo con _id)
      const createdQuery = await this.queryService.createQuery({
        user: user,
        content: this.queryText,
        targets: this.selectedTargetIds
      });

      let dockingJobsSubmitted = 0;

      if (this.autoDock) {
        // 2. Esperar a que los compuestos estén disponibles
        const compoundsInfo = await this.waitForCompounds(createdQuery._id);
        if (compoundsInfo.length === 0) {
          this.resultMessage = `Query submitted (${createdQuery.assays.length} assays) but no compounds found for docking.`;
        } else {
          // 3. Por cada target seleccionado, enviar un trabajo de docking
          for (const targetId of this.selectedTargetIds) {
            const target = this.userTargets.find(t => t._id === targetId);
            if (!target) continue;

            const payload: DockingSubmitPayload = {
              user: user,
              target_path: target.pdbqt_path,
              box_config_path: target.config_path,
              compounds: compoundsInfo.map(c => ({ id: c.id, path: c.path })),
              name: `Auto‑dock: ${this.queryText.substring(0, 50)}`,
              description: `Generated after query "${this.queryText}"`
            };
            try {
              await this.dockingService.submitDocking(payload);
              dockingJobsSubmitted++;
            } catch (err) {
              console.error(`Error submitting docking for target ${target.name}:`, err);
            }
          }
          this.resultMessage = `Query submitted. ${createdQuery.assays.length} assays found. Auto‑docking started for ${dockingJobsSubmitted} target(s).`;
        }
      } else {
        this.resultMessage = `Query submitted. ${createdQuery.assays.length} assays found.`;
      }
      this.resultType = 'success';

      // Reset del formulario (opcional)
      this.queryText = '';
      this.selectedTargetIds = [];
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((cb: any) => (cb.checked = false));

    } catch (err: any) {
      this.resultMessage = err.error?.detail || 'Error submitting query.';
      this.resultType = 'error';
    } finally {
      this.loading = false;
    }
  }
}
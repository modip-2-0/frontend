import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TargetService, Target } from '../services/target.service';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-targets',
  imports: [CommonModule, FormsModule],
  templateUrl: './targets.component.html',
  styleUrls: ['./targets.component.css']
})
export class TargetsComponent implements OnInit {
  private targetService = inject(TargetService);
  private auth = inject(AuthService);

  newTarget = {
    name: '',
    receptor: 'human',
    pdbqtFile: null as File | null,
    configFile: null as File | null
  };
  receptors = ['human', 'bovine'];
  customReceptor = '';
  receptorChoice: 'predefined' | 'custom' = 'predefined';

  loadingCreate = false;
  createError = '';

  targets: Target[] = [];
  selectedTarget: Target | null = null;
  deletingTarget = false;

  ngOnInit(): void {
    this.loadTargets();
  }

  async loadTargets() {
    const user = this.auth.getEmail();
    if (!user) return;
    try {
      this.targets = await this.targetService.getUserTargets(user);
    } catch (err) {
      console.error('Error loading targets', err);
    }
  }

  onPdbqtChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.newTarget.pdbqtFile = input.files[0];
  }

  onConfigChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.newTarget.configFile = input.files[0];
  }

  onReceptorSelectChange(value: string) {
    if (value === 'other') {
      this.receptorChoice = 'custom';
      this.newTarget.receptor = this.customReceptor;
    } else {
      this.receptorChoice = 'predefined';
      this.newTarget.receptor = value;
    }
  }

  async onSubmit() {
    if (!this.newTarget.name || !this.newTarget.pdbqtFile || !this.newTarget.configFile) {
      this.createError = 'All fields and files are required.';
      return;
    }
    const finalReceptor = this.receptorChoice === 'custom' ? this.customReceptor.trim() : this.newTarget.receptor;
    if (!finalReceptor) {
      this.createError = 'Receptor is required.';
      return;
    }

    this.loadingCreate = true;
    this.createError = '';
    const formData = new FormData();
    formData.append('name', this.newTarget.name);
    formData.append('receptor', finalReceptor);
    formData.append('user', this.auth.getEmail() || '');
    formData.append('pdbqt_file', this.newTarget.pdbqtFile);
    formData.append('config_file', this.newTarget.configFile);

    try {
      await this.targetService.createTarget(formData);
      this.newTarget = { name: '', receptor: 'human', pdbqtFile: null, configFile: null };
      this.customReceptor = '';
      this.receptorChoice = 'predefined';
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input: any) => (input.value = ''));
      this.targetService.clearCache(this.auth.getEmail()!);
      await this.loadTargets();
    } catch (err: any) {
      this.createError = err.error?.detail || 'Error creating target';
    } finally {
      this.loadingCreate = false;
    }
  }

  // Modal
  selectTarget(target: Target) {
    this.selectedTarget = target;
  }

  closeModal() {
    this.selectedTarget = null;
  }

  // Descarga / sustitución stubs
  onDownloadFile(type: 'pdbqt' | 'config') {
    if (!this.selectedTarget) return;
    this.targetService.downloadTargetFile(this.selectedTarget._id, type);
    alert('Descarga no implementada aún');
  }

  onReplaceFileChange(event: Event, type: 'pdbqt' | 'config') {
    const input = event.target as HTMLInputElement;
    if (input.files?.length && this.selectedTarget) {
      this.targetService.replaceTargetFile(this.selectedTarget._id, type, input.files[0]);
      alert('Sustitución no implementada aún');
      input.value = '';
    }
  }

  // --- Eliminar target ---
  async deleteTarget(target: Target) {
    if (!confirm(`Are you sure you want to delete target "${target.name}"? This action cannot be undone.`)) {
      return;
    }
    this.deletingTarget = true;
    try {
      await this.targetService.deleteTarget(target._id);
      this.selectedTarget = null; // cierra el modal
      this.targetService.clearCache(this.auth.getEmail()!);
      await this.loadTargets();
    } catch (err: any) {
      console.error('Error deleting target', err);
      alert(err.error?.detail || 'Could not delete target');
    } finally {
      this.deletingTarget = false;
    }
  }
}
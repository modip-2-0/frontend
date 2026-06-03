import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface DockingCompound {
  id: string;
  path: string;
}

export interface DockingSubmitPayload {
  user: string;
  target_path: string;
  box_config_path: string;
  compounds: DockingCompound[];
  name?: string;
  description?: string;
}

export interface DockingResultCompound {
  compound_id: string;
  compound_path: string;
  status: string;
  affinity?: number;
  rmsd_lb?: number;
  rmsd_ub?: number;
  num_rotatable_bonds?: number;
  output_file?: string;
  error?: string;
}

export interface DockingJob {
  _id?: string;
  job_id?: string;
  user: string;
  name?: string;
  description?: string;
  target_path: string;
  target_filename?: string;
  box_config_path: string;
  box_config: any;
  compounds: Record<string, string>;
  results: Record<string, DockingResultCompound>;
  status: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
  processing_log?: string[];
}

@Injectable({ providedIn: 'root' })
export class DockingService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8001';

  private jobListCache = new Map<string, string[]>();
  private jobDetailCache = new Map<string, DockingJob>();

  async listUserDockingJobs(user: string, limit: number = 100): Promise<string[]> {
    if (this.jobListCache.has(user)) {
      return this.jobListCache.get(user)!;
    }
    const ids = await firstValueFrom(
      this.http.get<string[]>(`${this.baseUrl}/docking/user/${user}?limit=${limit}`)
    );
    this.jobListCache.set(user, ids);
    return ids;
  }

  async getDockingJob(jobId: string): Promise<DockingJob> {
    const cached = this.jobDetailCache.get(jobId);
    if (cached && cached.status !== 'running') {
      return cached;
    }
    const job = await firstValueFrom(this.http.get<DockingJob>(`${this.baseUrl}/docking/${jobId}`));
    this.jobDetailCache.set(jobId, job);
    return job;
  }

  /** Devuelve el trabajo desde caché sin hacer petición alguna (o null si no está). */
  getCachedJob(jobId: string): DockingJob | null {
    return this.jobDetailCache.get(jobId) || null;
  }

  /** Lista de IDs desde caché (null si no existe). */
  getCachedJobList(user: string): string[] | null {
    return this.jobListCache.get(user) || null;
  }

  async submitDocking(payload: DockingSubmitPayload): Promise<{ job_id: string; status: string; message: string }> {
    return firstValueFrom(this.http.post<any>(`${this.baseUrl}/docking/submit`, payload));
  }

  async listDockingJobs(limit: number = 100): Promise<string[]> {
    return firstValueFrom(this.http.get<string[]>(`${this.baseUrl}/docking/?limit=${limit}`));
  }

  async deleteDockingJob(jobId: string): Promise<{ message: string }> {
    return firstValueFrom(this.http.delete<any>(`${this.baseUrl}/docking/${jobId}`));
  }

  clearJobListCache(user: string) {
    this.jobListCache.delete(user);
  }

  clearJobDetailCache(jobId?: string) {
    if (jobId) {
      this.jobDetailCache.delete(jobId);
    } else {
      this.jobDetailCache.clear();
    }
  }
}
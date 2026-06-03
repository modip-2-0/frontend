import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DockingService, DockingJob } from '../services/docking.service';
import { AuthService } from '../services/auth.service';
import { BasenamePipe } from '../pipes/basename.pipe';

@Component({
  standalone: true,
  selector: 'app-all-docking',
  imports: [CommonModule, BasenamePipe],
  templateUrl: './all-docking.component.html',
  styleUrls: ['./all-docking.component.css']
})
export class AllDockingComponent implements OnInit, OnDestroy {
  private dockingService = inject(DockingService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  jobIds: string[] = [];
  jobsMap: Map<string, DockingJob> = new Map();
  loading = true;
  error = '';
  selectedJob: DockingJob | null = null;

  private refreshInterval: any = null;
  private readonly POLL_INTERVAL_MS = 60_000;

  ngOnInit() {
    this.initLoad();
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private initLoad() {
    const user = this.auth.getEmail();
    if (!user) {
      this.error = 'User not logged in.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    const cachedIds = this.dockingService.getCachedJobList(user);
    if (cachedIds && cachedIds.length > 0) {
      cachedIds.forEach(id => {
        const job = this.dockingService.getCachedJob(id);
        if (job) this.jobsMap.set(id, job);
      });
      this.jobIds = cachedIds;
      this.loading = false;
      this.cdr.detectChanges();
      this.refreshJobsInBackground(user);
    } else {
      this.loadJobs(user);
    }
  }

  private async loadJobs(user: string) {
    try {
      const ids = await this.dockingService.listUserDockingJobs(user, 100);
      this.jobIds = ids;
      if (ids.length === 0) {
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }

      const promises = ids.map(id =>
        this.dockingService.getDockingJob(id).catch(err => {
          console.error(`Error fetching job ${id}:`, err);
          return null;
        })
      );
      const jobs = await Promise.all(promises);

      const newMap = new Map<string, DockingJob>();
      ids.forEach((id, index) => {
        if (jobs[index]) newMap.set(id, jobs[index]);
      });
      this.jobsMap = newMap;
      this.startPollingIfNeeded();
    } catch (err: any) {
      this.error = err.error?.detail || 'Failed to load docking jobs.';
      console.error(this.error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private async refreshJobsInBackground(user: string) {
    try {
      const freshIds = await this.dockingService.listUserDockingJobs(user, 100);
      if (freshIds.length === 0) {
        this.jobIds = [];
        this.jobsMap.clear();
        this.cdr.detectChanges();
        return;
      }

      const promises = freshIds.map(id =>
        this.dockingService.getDockingJob(id).catch(err => {
          console.error(`Error refreshing job ${id}:`, err);
          return null;
        })
      );
      const jobs = await Promise.all(promises);

      const newMap = new Map<string, DockingJob>();
      freshIds.forEach((id, index) => {
        if (jobs[index]) newMap.set(id, jobs[index]);
      });

      this.jobIds = freshIds;
      this.jobsMap = newMap;
      this.startPollingIfNeeded();
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Background refresh failed', err);
    }
  }

  // ──────────── PROGRESO REAL (CORREGIDO) ────────────
  getProgress(job: DockingJob): number {
    if (!job) return 0;

    const results = job.results || {};
    const compounds = job.compounds || {};

    let total = Object.keys(results).length;
    if (total === 0) {
      total = Object.keys(compounds).length;
    }
    if (total === 0) return 0;

    const completed = Object.values(results).filter(
      (r: any) => r && r.status === 'completed'
    ).length;

    const progress = Math.round((completed / total) * 100);

    // Descomenta para depurar si algún trabajo sigue mostrando 0%
    // if (progress === 0 && total > 0) {
    //   console.warn('Progress 0% for job', job._id, job);
    // }

    return progress;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':   return 'status-pending';
      case 'running':   return 'status-running';
      case 'completed': return 'status-completed';
      case 'failed':    return 'status-failed';
      default:          return '';
    }
  }

  async deleteJob(jobId: string, event: Event) {
    event.stopPropagation();
    if (!confirm('Delete this docking job?')) return;
    try {
      await this.dockingService.deleteDockingJob(jobId);
      this.jobIds = this.jobIds.filter(id => id !== jobId);
      this.jobsMap.delete(jobId);
      this.dockingService.clearJobDetailCache(jobId);
      this.startPollingIfNeeded();
      this.cdr.detectChanges();
    } catch (err: any) {
      alert('Error deleting job: ' + (err.error?.detail || err.message));
    }
  }

  showDetails(job: DockingJob) {
    this.selectedJob = job;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.selectedJob = null;
    this.cdr.detectChanges();
  }

  // ── Polling ──
  private startPollingIfNeeded() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    if (!this.hasRunningJobs()) return;

    this.refreshInterval = setInterval(() => {
      if (this.hasRunningJobs()) {
        this.refreshRunningJobs();
      } else {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    }, this.POLL_INTERVAL_MS);
  }

  private hasRunningJobs(): boolean {
    for (const job of this.jobsMap.values()) {
      if (job.status === 'running') return true;
    }
    return false;
  }

  private async refreshRunningJobs() {
    const runningIds = this.jobIds.filter(id => {
      const job = this.jobsMap.get(id);
      return job?.status === 'running';
    });
    if (runningIds.length === 0) {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
      return;
    }

    const promises = runningIds.map(id =>
      this.dockingService.getDockingJob(id).catch(err => {
        console.error(`Error refreshing job ${id}:`, err);
        return null;
      })
    );
    const results = await Promise.all(promises);

    runningIds.forEach((id, index) => {
      if (results[index]) this.jobsMap.set(id, results[index]);
    });

    this.cdr.detectChanges();
    this.startPollingIfNeeded();
  }
}
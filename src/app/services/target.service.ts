import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Target {
  _id: string;
  name: string;
  receptor: string;
  user: string;
  pdbqt_path: string;
  config_path: string;
}

@Injectable({ providedIn: 'root' })
export class TargetService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8000';

  private targetsCache = new Map<string, Target[]>();

  async getUserTargets(username: string): Promise<Target[]> {
    if (this.targetsCache.has(username)) {
      return this.targetsCache.get(username)!;
    }
    const response = await firstValueFrom(
      this.http.get<Target[]>(`${this.baseUrl}/target/user/${username}`)
    );
    this.targetsCache.set(username, response);
    return response;
  }

  clearCache(username: string): void {
    this.targetsCache.delete(username);
  }

  async createTarget(formData: FormData): Promise<Target> {
    return firstValueFrom(
      this.http.post<Target>(`${this.baseUrl}/target/create`, formData)
    );
  }

  /** Elimina un target por su id. */
  async deleteTarget(targetId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/target/${targetId}`)
    );
  }

  // Stubs (funcionalidad futura)
  async downloadTargetFile(targetId: string, fileType: 'pdbqt' | 'config'): Promise<void> {
    console.warn(`downloadTargetFile(${targetId}, ${fileType}) no implementado`);
  }

  async replaceTargetFile(targetId: string, fileType: 'pdbqt' | 'config', file: File): Promise<void> {
    console.warn(`replaceTargetFile(${targetId}, ${fileType}, ${file.name}) no implementado`);
  }
}
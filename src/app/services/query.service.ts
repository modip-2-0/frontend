import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface CompoundInfo {
  id: string;
  path: string;
}

export interface QueryInput {
  user: string;
  content: string;
  targets: string[];
}

export interface QueryDB extends QueryInput {
  _id: string;
  assays: number[];
  compounds: number[];
}

@Injectable({ providedIn: 'root' })
export class QueryService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8000';

  // Caché para getUserQueries por usuario
  private queriesCache = new Map<string, QueryDB[]>();

  async createQuery(query: QueryInput): Promise<QueryDB> {
    return firstValueFrom(this.http.post<QueryDB>(`${this.baseUrl}/queries/`, query));
  }

  /**
   * Obtiene las queries del usuario. Si ya están en caché, las devuelve sin llamar al backend.
   */
  async getUserQueries(username: string): Promise<QueryDB[]> {
    if (this.queriesCache.has(username)) {
      return this.queriesCache.get(username)!;
    }
    const response = await firstValueFrom(
      this.http.get<QueryDB[]>(`${this.baseUrl}/queries/user/${username}`)
    );
    this.queriesCache.set(username, response);
    return response;
  }

  async getCompoundsByQueryId(queryId: string): Promise<CompoundInfo[]> {
    return firstValueFrom(
      this.http.get<CompoundInfo[]>(`${this.baseUrl}/queries/${queryId}/compounds`)
    );
  }

  async hasCompounds(queryId: string): Promise<boolean> {
    const query = await firstValueFrom(this.http.get<QueryDB>(`${this.baseUrl}/queries/${queryId}`));
    return query.compounds && query.compounds.length > 0;
  }

  /** Limpia la caché de queries del usuario. Útil tras crear o eliminar queries. */
  clearCache(username: string): void {
    this.queriesCache.delete(username);
  }
}
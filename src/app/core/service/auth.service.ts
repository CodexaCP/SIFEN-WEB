import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface LoginPayload {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    mustChangePassword: boolean;
}

export interface SessionUser {
    userId: number | string;
    companyId: number | string | null;
    tenantId?: string | null;
    tenantName?: string | null;
    role: string;
    fullName?: string;
    displayName?: string;
    email?: string;
    permissions?: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly baseUrl = environment.apiUrl;
    private readonly tokenKey = 'token';
    private readonly displayNameKey = 'current_display_name';
    private readonly sessionUserKey = 'current_session_user';

    constructor(private http: HttpClient) {}

    login(payload: LoginPayload): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload);
    }

    me() {
        return this.http.get<SessionUser>(`${this.baseUrl}/auth/me`);
    }

    saveToken(token: string) {
        localStorage.setItem(this.tokenKey, token);
    }

    saveDisplayName(displayName: string) {
        if (displayName?.trim()) {
            localStorage.setItem(this.displayNameKey, displayName.trim());
        }
    }

    saveSessionUser(user: SessionUser) {
        localStorage.setItem(this.sessionUserKey, JSON.stringify(user));
        if (user.displayName) {
            this.saveDisplayName(user.displayName);
        }
    }

    getDisplayName() {
        return localStorage.getItem(this.displayNameKey) || localStorage.getItem('remember_username') || 'Usuario';
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    clearToken() {
        localStorage.removeItem(this.tokenKey);
    }

    logout() {
        localStorage.removeItem('pending_password_change');
        localStorage.removeItem('remember_username');
        localStorage.removeItem(this.displayNameKey);
        localStorage.removeItem(this.sessionUserKey);
        localStorage.removeItem('sifen_selected_tenant');
        localStorage.removeItem('sifen_selected_tenant_name');
        this.clearToken();
    }

    setPendingPasswordChange(value: boolean) {
        localStorage.setItem('pending_password_change', value ? 'true' : 'false');
    }

    hasPendingPasswordChange(): boolean {
        return localStorage.getItem('pending_password_change') === 'true';
    }

    clearPendingPasswordChange() {
        localStorage.removeItem('pending_password_change');
    }

    isLogged() {
        const token = this.getToken();
        return !!token && !this.isTokenExpired(token);
    }

    getSession(): SessionUser | null {
        const storedSession = this.getStoredSession();
        if (storedSession) {
            return storedSession;
        }

        const payload = this.decodeToken();
        if (!payload) {
            return null;
        }

        const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload['role'] || '';

        return {
            userId: String(payload['userId'] ?? ''),
            companyId: payload['companyId'] != null ? String(payload['companyId']) : null,
            tenantId: payload['tenantId'] != null ? String(payload['tenantId']) : null,
            role: String(role).toUpperCase(),
            fullName: String(payload['fullName'] ?? payload['name'] ?? this.getDisplayName()),
            displayName: this.getDisplayName()
        };
    }

    isRole(...roles: string[]): boolean {
        const session = this.getSession();
        if (!session) {
            return false;
        }

        return roles.map((role) => role.toUpperCase()).includes(session.role);
    }

    private isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            return Date.now() >= Number(payload.exp) * 1000;
        } catch {
            return true;
        }
    }

    private getStoredSession(): SessionUser | null {
        const rawValue = localStorage.getItem(this.sessionUserKey);
        if (!rawValue) {
            return null;
        }

        try {
            const parsed = JSON.parse(rawValue) as SessionUser;
            if (!parsed?.role) {
                return null;
            }

            return {
                ...parsed,
                role: String(parsed.role).toUpperCase(),
                tenantId: parsed.tenantId != null ? String(parsed.tenantId) : null,
                fullName: parsed.fullName || parsed.displayName || this.getDisplayName(),
                displayName: parsed.displayName || this.getDisplayName()
            };
        } catch {
            return null;
        }
    }

    private decodeToken(): Record<string, unknown> | null {
        const token = this.getToken();
        if (!token) {
            return null;
        }

        try {
            return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        } catch {
            return null;
        }
    }
}

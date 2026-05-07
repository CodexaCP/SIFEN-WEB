import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from '@core/service/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    mode: 'login' | 'register' | 'change-password' = 'login';

    loginData = {
        username: '',
        password: ''
    };

    registerData = {
        username: '',
        firstName: '',
        lastName: '',
        country: '+595',
        phone: '',
        email: ''
    };

    countryOptions = [
        { label: '🇵🇾 +595', value: '+595' },
        { label: '🇧🇷 +55', value: '+55' },
        { label: '🇦🇷 +54', value: '+54' },
        { label: '🇺🇸 +1', value: '+1' }
    ];

    changePasswordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };

    remember = true;
    loading = false;
    error = '';
    success = '';

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit() {
        const rememberedUsername = localStorage.getItem('remember_username');
        if (rememberedUsername) {
            this.loginData.username = rememberedUsername;
        }
    }

    switchMode(mode: 'login' | 'register') {
        if (this.loading) {
            return;
        }

        this.mode = mode;
        this.error = '';
        this.success = '';
    }

    login() {
        if (this.loading) {
            return;
        }

        if (!this.loginData.username || !this.loginData.password) {
            this.error = 'Completa usuario y contrasena.';
            return;
        }

        this.loading = true;
        this.error = '';
        this.success = '';

        this.authService.login(this.loginData).subscribe({
            next: (response) => this.handleAuthSuccess(response, this.loginData.password),
            error: (error) => {
                this.error = this.extractErrorMessage(error, 'No se pudo iniciar sesion.');
                this.loading = false;
            }
        });
    }

    register() {
        if (this.loading) {
            return;
        }

        const { username, firstName, lastName, phone, email } = this.registerData;
        if (!username || !firstName || !lastName || !phone || !email) {
            this.error = 'Completa todos los datos de registro.';
            return;
        }

        if (!this.isValidEmail(email.trim())) {
            this.error = 'Ingresa un correo valido.';
            return;
        }

        const normalizedPhone = this.normalizePhone(phone);
        if (normalizedPhone.length < 6 || normalizedPhone.length > 15) {
            this.error = 'Ingresa solo numeros y verifica la longitud del telefono.';
            return;
        }

        this.loading = true;
        this.error = '';
        this.success = '';

        this.authService.register({
            username: username.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: `${this.registerData.country}${normalizedPhone}`,
            email: email.trim()
        }).subscribe({
            next: (response) => {
                this.loginData.username = this.registerData.username;
                this.authService.saveDisplayName(`${firstName.trim()} ${lastName.trim()}`);
                this.success = 'Cuenta creada. Debes actualizar la contrasena inicial para continuar.';
                this.handleAuthSuccess(response, '123456');
            },
            error: (error) => {
                this.error = this.extractErrorMessage(error, 'No se pudo completar el registro.');
                this.loading = false;
            }
        });
    }

    changePassword() {
        if (this.loading) {
            return;
        }

        if (!this.changePasswordData.currentPassword || !this.changePasswordData.newPassword) {
            this.error = 'Completa la contrasena actual y la nueva.';
            return;
        }

        if (!this.isStrongPassword(this.changePasswordData.newPassword)) {
            this.error = 'Usa minimo 8 caracteres, una mayuscula, un numero y un caracter especial.';
            return;
        }

        if (this.changePasswordData.newPassword !== this.changePasswordData.confirmPassword) {
            this.error = 'La confirmacion no coincide con la nueva contrasena.';
            return;
        }

        this.loading = true;
        this.error = '';

        this.authService.changePassword({
            currentPassword: this.changePasswordData.currentPassword,
            newPassword: this.changePasswordData.newPassword
        }).subscribe({
            next: () => {
                this.authService.clearPendingPasswordChange();
                this.loading = false;
                this.navigateAfterLogin();
            },
            error: (error) => {
                this.error = this.extractErrorMessage(error, 'No se pudo actualizar la contrasena.');
                this.loading = false;
            }
        });
    }

    onInputChange() {
        this.error = '';
        this.success = '';
    }

    private handleAuthSuccess(response: LoginResponse, currentPassword: string) {
        this.authService.saveToken(response.token);
        this.authService.setPendingPasswordChange(response.mustChangePassword);

        const remembered = this.loginData.username || this.registerData.username;
        this.authService.saveDisplayName(
            this.mode === 'register'
                ? `${this.registerData.firstName.trim()} ${this.registerData.lastName.trim()}`
                : remembered
        );

        if (this.remember && remembered) {
            localStorage.setItem('remember_username', remembered);
        } else {
            localStorage.removeItem('remember_username');
        }

        this.changePasswordData.currentPassword = currentPassword;
        this.changePasswordData.newPassword = '';
        this.changePasswordData.confirmPassword = '';

        if (response.mustChangePassword) {
            this.mode = 'change-password';
            this.loading = false;
            return;
        }

        this.loading = false;
        this.navigateAfterLogin();
    }

    private navigateAfterLogin() {
        const session = this.authService.getSession();
        if (session?.role === 'CUSTOMER') {
            this.router.navigate(['/dashboard/servicesrequest']);
            return;
        }

        this.router.navigate(['/dashboard']);
    }

    private extractErrorMessage(error: any, fallback: string) {
        const message = error?.error?.message || error?.error?.error?.message || error?.error?.error || error?.message || fallback;

        if (typeof message === 'string' && message.includes('Username ya registrado')) {
            return 'El usuario ya esta registrado. Elige otro nombre de usuario.';
        }

        if (typeof message === 'string' && message.includes('Email ya registrado')) {
            return 'El correo ya esta registrado. Ingresa otro correo.';
        }

        if (typeof message === 'string' && message.includes('Invalid credentials')) {
            return 'Usuario o contrasena incorrectos.';
        }

        return message;
    }

    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    private normalizePhone(phone: string): string {
        return (phone || '').replace(/\D/g, '');
    }

    private isStrongPassword(password: string): boolean {
        return password.length >= 8
            && /[A-Z]/.test(password)
            && /\d/.test(password)
            && /[^A-Za-z0-9]/.test(password);
    }
}

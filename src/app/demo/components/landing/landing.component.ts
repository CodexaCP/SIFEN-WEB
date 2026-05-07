import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
    private readonly sifenInterestStorageKey = 'codexa.sifen-interest';
    readonly heroModules = [
        { icon: 'pi pi-mobile', label: 'Apps moviles' },
        { icon: 'pi pi-globe', label: 'Desarrollo web' },
        { icon: 'pi pi-cog', label: 'Automatizacion' },
        { icon: 'pi pi-shield', label: 'Integraciones seguras' }
    ];

    readonly serviceCards = [
        {
            icon: 'pi pi-mobile',
            badge: 'Mobile',
            title: 'Apps moviles',
            description: 'Experiencias nativas y operativas para equipos que necesitan velocidad, seguimiento y accion desde el telefono.'
        },
        {
            icon: 'pi pi-desktop',
            badge: 'Web',
            title: 'Desarrollo web',
            description: 'Plataformas modernas, paneles de control y portales con identidad de marca, rendimiento y foco comercial.'
        },
        {
            icon: 'pi pi-briefcase',
            badge: 'Core',
            title: 'Sistemas administrativos',
            description: 'Procesos internos, roles, permisos, trazabilidad y operacion diaria centralizada en una sola solucion.'
        },
        {
            icon: 'pi pi-bolt',
            badge: 'Flow',
            title: 'Automatizacion de procesos',
            description: 'Reducimos tareas manuales y repetitivas con flujos mas simples, consistentes y escalables.'
        },
        {
            icon: 'pi pi-link',
            badge: 'API',
            title: 'Integraciones y APIs',
            description: 'Conectamos sistemas, servicios externos y canales digitales para que tu operacion no viva en silos.'
        },
        {
            icon: 'pi pi-cog',
            badge: 'Custom',
            title: 'Soluciones a medida',
            description: 'Software disenado para el modelo real de tu negocio, no al reves. Construimos lo que de verdad necesitas.'
        }
    ];

    readonly upcomingTabs = [
        { id: 'future-sifen', label: 'SIFEN' },
        { id: 'future-encomiendas', label: 'Encomiendas' }
    ];

    readonly sifenBadges = ['Proximamente', 'En desarrollo', 'SaaS B2B', 'Publicidad de modulo futuro'];
    readonly courierBadges = ['Proximamente', 'En desarrollo', 'Publicidad de modulo futuro'];

    readonly sifenBenefits = [
        'Facturacion electronica para multiples clientes desde una sola plataforma',
        'Operacion mas ordenada, trazable y confiable para tu equipo',
        'Onboarding mas simple para nuevos contribuyentes',
        'Base lista para crecer sin depender de soluciones improvisadas'
    ];

    readonly futureCourierFeatures = [
        'Registro de envios',
        'Rastreo de paquetes',
        'Estados de entrega',
        'Gestion de clientes',
        'Comprobantes y adjuntos',
        'Pickup y entrega puerta a puerta',
        'Soporte para ecommerce',
        'Logistica inversa'
    ];

    readonly whyCodexa = [
        {
            icon: 'pi pi-bolt',
            title: 'Rapido y eficiente',
            description: 'Entregamos con foco en impacto real, velocidad de ejecucion y claridad comercial desde el primer paso.'
        },
        {
            icon: 'pi pi-code',
            title: 'Codigo limpio y escalable',
            description: 'Construimos bases tecnicas pensadas para crecer sin romper producto, experiencia ni mantenibilidad.'
        },
        {
            icon: 'pi pi-shield',
            title: 'Seguro y confiable',
            description: 'Roles, control de acceso y arquitectura ordenada para cuidar operaciones, datos y continuidad.'
        },
        {
            icon: 'pi pi-send',
            title: 'Innovamos para el futuro',
            description: 'Pensamos en modulos, expansion, automatizacion y evoluciones futuras desde el inicio del proyecto.'
        }
    ];

    readonly proofStats = [
        { value: '01', label: 'Tenant productivo activo' },
        { value: 'Web + APK', label: 'Experiencias conectadas' },
        { value: 'SaaS Ready', label: 'Base lista para crecer' }
    ];

    interestMessage = '';
    sifenInfoMessage = '';
    lastSifenRequest: { type: string; timestamp: string } | null = null;

    constructor(private router: Router) {
        this.restoreSifenInterest();
    }

    scrollTo(id: string): void {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    openQuoteRequest(): void {
        this.interestMessage = 'Estamos listos para escuchar tu idea. Cuentanos que tipo de sistema quieres cotizar y te mostraremos el mejor camino de trabajo.';
        this.scrollTo('contact');
    }

    viewSolutions(): void {
        this.scrollTo('services');
    }

    requestFutureModule(source: string): void {
        this.interestMessage = `Gracias por tu interes en el modulo de encomiendas. La accion "${source}" es demostrativa por ahora; dejanos tus datos y te contactaremos con informacion.`;
        this.scrollTo('contact');
    }

    requestSifenInfo(source: string): void {
        const timestamp = new Date().toISOString();
        this.lastSifenRequest = { type: source, timestamp };
        this.sifenInfoMessage = `Solicitud registrada: ${source}. Fecha: ${new Date(timestamp).toLocaleString('es-PY')}.`;
        localStorage.setItem(this.sifenInterestStorageKey, JSON.stringify(this.lastSifenRequest));
        this.interestMessage = `Gracias por tu interes en la solucion de facturacion electronica SIFEN. La accion "${source}" es demostrativa por ahora; dejanos tus datos y te contactaremos.`;
    }

    requestTenantSlot(): void {
        this.interestMessage = 'Tu empresa puede ser la proxima en vivir dentro de la plataforma Codexa. Esta accion es demostrativa por ahora; dejanos tus datos y te contactaremos.';
        this.scrollTo('contact');
    }

    goToSifenDemo(): void {
        this.router.navigate(['/sifen/login']);
    }

    goToCompany(companySlug: string): void {
        if (companySlug === 'sifen') {
            this.router.navigate(['/sifen/login']);
            return;
        }

        if (companySlug === 'tramiya' || companySlug === 'serviciosya') {
            this.router.navigate(['/auth']);
            return;
        }

        this.router.navigate(['/auth']);
    }

    goToLogin(): void {
        this.router.navigate(['/auth']);
    }

    private restoreSifenInterest(): void {
        const storedValue = localStorage.getItem(this.sifenInterestStorageKey);
        if (!storedValue) {
            return;
        }

        try {
            const parsed = JSON.parse(storedValue) as { type?: string; timestamp?: string };
            if (!parsed.type || !parsed.timestamp) {
                return;
            }

            this.lastSifenRequest = {
                type: parsed.type,
                timestamp: parsed.timestamp
            };
            this.sifenInfoMessage = `Ultima solicitud registrada: ${parsed.type}. Fecha: ${new Date(parsed.timestamp).toLocaleString('es-PY')}.`;
        } catch {
            localStorage.removeItem(this.sifenInterestStorageKey);
        }
    }
}

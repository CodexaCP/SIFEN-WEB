import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';
import { CustomersService } from 'src/app/pages/customers/services/customers.service';
import { ServiceRequestCancellationReminder, ServiceRequestsService } from 'src/app/pages/servicesrequest/services/servicesrequest.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AuthService } from '@core/service/auth.service';

@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
    chartData: any;
    chartOptions: any;
    subscription!: Subscription;

    totalRequests = 0;
    pendingPayments = 0;
    totalRevenue = 0;
    totalCustomers = 0;
    totalManagers = 0;
    inProcess = 0;

    recentRequests: any[] = [];
    notifications: string[] = [];
    cancellationReminders: ServiceRequestCancellationReminder[] = [];
    statusBreakdown: { label: string; value: number; className: string }[] = [];
    isManager = false;
    canManageServices = false;
    loading = false;

    constructor(
        public layoutService: LayoutService,
        private requestService: ServiceRequestsService,
        private customerService: CustomersService,
        private authService: AuthService,
        private messageService: MessageService,
        private router: Router
    ) {
        this.subscription = this.layoutService.configUpdate$.subscribe(() => {
            this.initChart([]);
        });
    }

    async ngOnInit() {
        const role = this.authService.getSession()?.role ?? '';
        this.isManager = ['SUPER_ADMIN', 'ADMIN_GENERAL', 'GESTOR_SUPREMO', 'GESTOR'].includes(role);
        this.canManageServices = ['SUPER_ADMIN', 'ADMIN_GENERAL', 'GESTOR_SUPREMO'].includes(role);
        await this.loadDashboard();
    }

    async loadDashboard() {
        this.loading = true;

        try {
            const requestsResponse = await firstValueFrom(
                this.isManager ? this.requestService.getAll(1, 1000) : this.requestService.getMy()
            );
            const requests = requestsResponse?.data || [];

            this.totalRequests = requestsResponse?.totalRows || requests.length;
            this.recentRequests = requests.slice(0, 6);
            this.pendingPayments = requests.filter((request: any) => request.paymentStatus === 'PENDIENTE').length;
            this.inProcess = requests.filter((request: any) => request.status === 'EN_PROCESO').length;
            this.totalRevenue = requests
                .filter((request: any) => request.paymentStatus === 'VALIDADO')
                .reduce((sum: number, request: any) => sum + Number(request.price || 0), 0);

            this.notifications = requests.slice(0, 8).map((request: any) => `${request.serviceName} - ${request.status}`);

            if (this.isManager) {
                const usersResponse = await firstValueFrom(this.customerService.getAll());
                const users = usersResponse?.data || [];
                this.totalCustomers = users.filter((user: any) => user.role === 'CUSTOMER').length;
                this.totalManagers = users.filter((user: any) => user.role === 'GESTOR_SUPREMO' || user.role === 'ADMIN_GENERAL' || user.role === 'GESTOR').length;
                this.cancellationReminders = await firstValueFrom(this.requestService.getCancellationReminders());
            }

            this.initChart(requests);
            this.loading = false;
        } catch (error) {
            console.error('Error cargando dashboard', error);
            this.loading = false;
            this.messageService.add({
                severity: 'error',
                summary: 'No se pudo cargar el dashboard',
                detail: 'Verifica la conexion con la API e intenta nuevamente.'
            });
        }
    }

    goToRequests() {
        this.router.navigate(['/dashboard/servicesrequest']);
    }

    goToCreateRequest() {
        this.router.navigate(['/dashboard/servicesrequest/create']);
    }

    goToServices() {
        this.router.navigate(['/dashboard/services']);
    }

    goToUsers() {
        this.router.navigate(['/dashboard/customers']);
    }

    async confirmRefund(reminder: ServiceRequestCancellationReminder) {
        try {
            await firstValueFrom(this.requestService.confirmRefund(reminder.requestID));
            this.cancellationReminders = this.cancellationReminders.filter((item) => item.reminderID !== reminder.reminderID);
            this.messageService.add({
                severity: 'success',
                summary: 'Reintegro confirmado',
                detail: `La solicitud #${reminder.requestID} paso a pago reintegrado.`
            });
        } catch {
            this.messageService.add({
                severity: 'error',
                summary: 'No se pudo actualizar',
                detail: 'Intenta nuevamente en unos segundos.'
            });
        }
    }

    initChart(data: any[]) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const counts = {
            solicitadas: data.filter((request: any) => request.status === 'SOLICITADO').length,
            proceso: data.filter((request: any) => request.status === 'EN_PROCESO').length,
            finalizadas: data.filter((request: any) => request.status === 'FINALIZADO').length,
            canceladas: data.filter((request: any) => `${request.status}`.startsWith('CANCELADO')).length
        };

        this.statusBreakdown = [
            { label: 'Solicitadas', value: counts.solicitadas, className: 'pending' },
            { label: 'En proceso', value: counts.proceso, className: 'progress' },
            { label: 'Finalizadas', value: counts.finalizadas, className: 'done' },
            { label: 'Canceladas', value: counts.canceladas, className: 'danger' }
        ];

        this.chartData = {
            labels: this.statusBreakdown.map((item) => item.label),
            datasets: [
                {
                    data: this.statusBreakdown.map((item) => item.value),
                    backgroundColor: ['#0799a6', '#f59e0b', '#4fbe66', '#e11d48'],
                    borderColor: '#ffffff',
                    borderWidth: 4,
                    hoverOffset: 8
                }
            ]
        };

        this.chartOptions = {
            cutout: '68%',
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        padding: 18
                    }
                }
            }
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SifenDiagnosticResult, SifenPlatformService } from '../services/sifen-platform.service';

@Component({
    selector: 'app-sifen-integration',
    templateUrl: './sifen-integration.component.html',
    styleUrls: ['./sifen-integration.component.scss']
})
export class SifenIntegrationComponent implements OnInit {
    readonly apiUrl = environment.apiUrl;
    readonly serverUrl = environment.serverUrl;
    readonly samplePayload = `{
  "environment": "Test",
  "establishmentCode": "001",
  "expeditionPointCode": "001",
  "documentNumber": "0000001",
  "securityCode": "123456789",
  "issueDate": "2026-04-29",
  "emisorDireccion": "Direccion del emisor",
  "currency": "PYG",
  "total": 100000,
  "customer": {
    "name": "Cliente Demo",
    "documentType": "Ruc",
    "documentNumber": "80099999"
  },
  "items": [
    {
      "description": "Servicio mensual",
      "quantity": 1,
      "unitPrice": 100000,
      "vatType": "Vat10"
    }
  ]
}`;

    tenantId: string | null = null;
    diagnostic?: SifenDiagnosticResult;
    errorMessage = '';

    get tenantName(): string {
        return this.sifenPlatformService.getActiveTenantName() || 'la empresa seleccionada';
    }

    constructor(private readonly sifenPlatformService: SifenPlatformService) {}

    ngOnInit(): void {
        this.tenantId = this.sifenPlatformService.getActiveTenantId();
        if (!this.tenantId) {
            return;
        }

        this.sifenPlatformService.getDiagnostic(this.tenantId).subscribe({
            next: (diagnostic) => {
                this.diagnostic = diagnostic;
            },
            error: (error) => {
                this.errorMessage = this.sifenPlatformService.getErrorMessage(error, 'No se pudo cargar el contexto tecnico del tenant.');
            }
        });
    }
}

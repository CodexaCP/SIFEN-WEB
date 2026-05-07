import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WmsService } from 'src/app/layout/service/wms.service';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';

@Component({
    selector: 'app-receipts-details',
    templateUrl: './receipts-details.component.html',
    styleUrls: ['./receipts-details.component.scss'],
})
export class ReceiptsDetailsComponent implements OnInit {
    environment = environment;

    receipt: any;
    lines: any[] = [];
    receiptNo: any;
    status: any;
    receiptDate: any;
    vendorName: any;

    header: any = { sortingMethod: [] };

    items: any[] = [];

    bins: any[] = [];

    postedReceiveHeaders: any[] = [];
    postedReceiveLines: any[] = [];

    constructor(
        private wmsService: WmsService,
        private location: Location,
        private route: ActivatedRoute,
    ) {}

    /* ===================================================== */
    /* INIT */
    /* ===================================================== */
    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');

        console.log('ID recibido:', id);

        if (id) {
            this.wmsService.getReceiptById(id).subscribe((receipt: any) => {
                console.log('Receipt:', receipt);
                this.lines = receipt.lines;
                this.receiptNo = receipt.receiptNo;
                this.status = receipt.status;
                this.receiptDate = this.formatDate(receipt.receiptDate);
                this.vendorName = receipt.vendorName;
                this.receipt = receipt;

                receipt.lines.forEach((line: any) => {
                    if (line.itemId) {
                        this.wmsService
                            .getItemById(line.itemId)
                            .subscribe((item: any) => {
                                this.items.push(item);
                                line.itemCode = item.itemNo;
                                line.description = item.description;
                            });

                        this.wmsService
                            .getBinById(line.binId)
                            .subscribe((bin: any) => {
                                this.bins.push(bin);
                                line.binCode = bin.binCode;
                            });
                    }
                });

                this.wmsService
                    .getPostedReceiptHeaderbyRHid(id, this.receipt.companyId)
                    .subscribe((postedReceiveHeader: any) => {
                        this.postedReceiveHeaders = postedReceiveHeader;

                        this.postedReceiveHeaders.forEach((header: any) => {
                            this.wmsService
                                .getPostedReceiptLinebyLid(
                                    header.id,
                                    this.receipt.companyId,
                                )
                                .subscribe((lines: any[]) => {
                                    this.postedReceiveLines.push(...lines);

                                    //  AQUI haces el match
                                    this.lines.forEach((line: any) => {
                                        const postedLines =
                                            this.postedReceiveLines.filter(
                                                (p: any) =>
                                                    p.receivingLineId ===
                                                    line.id,
                                            );

                                        if (postedLines.length > 0) {
                                            line.postedQty = postedLines.reduce(
                                                (sum: number, p: any) =>
                                                    sum + p.quantityReceived,
                                                0,
                                            );

                                            // opcional: tomar valores del ultimo
                                            const last =
                                                postedLines[
                                                    postedLines.length - 1
                                                ];
                                            line.postedUOM = last.uom;
                                            line.postedStatus = last.status;
                                        }
                                    });
                                });
                        });
                    });

                console.log('Bins:', this.bins);
                console.log('Items:', this.items);
                console.log(
                    'Posted Receive Header:',
                    this.postedReceiveHeaders,
                );
                console.log('Posted Receive Lines:', this.postedReceiveLines);
            });
        }
    }

    formatDate(dateStr: string): string {
        const date = new Date(dateStr);

        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const yyyy = date.getFullYear();

        return `${mm}/${dd}/${yyyy}`;
    }

    /* ===================================================== */
    /* Back FORM */
    /* ===================================================== */
    goBack() {
        this.location.back();
    }
}

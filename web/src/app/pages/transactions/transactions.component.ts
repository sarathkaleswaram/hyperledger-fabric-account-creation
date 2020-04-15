import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  txs = [];

  constructor(private apiService: APIService) { }

  ngOnInit() {
    this.apiService.getUserTxs({ accountId: 'admin' }).subscribe((data: any) => {
      if (data.status == "SUCCESS") {
        this.txs = data.data;
      } else {
        this.apiService.handleError(data.message);
      }
    }, error => {
      this.apiService.handleError(error);
    });
  }

}

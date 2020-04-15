import { Component, OnInit, ViewChild } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { UserAccounts, APIService } from 'src/app/services/api.service';
import { ClipboardService } from 'ngx-clipboard';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('popOver') public popover: NgbPopover;

  userAccounts: UserAccounts[] = [];
  onBoardAccounts: number;

  accountsLimit: number;
  showSpinner: boolean = false;
  message = "";

  constructor(private apiService: APIService, private _clipboardService: ClipboardService) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.apiService.getUsers().subscribe((data: any) => {
      console.log("getUsers:", data);
      if (data.status == "SUCCESS") {
        this.userAccounts = data.data;
        this.onBoardAccounts = this.userAccounts.filter(x => x.onBoard).length;
      } else {
        this.message = data.message;
      }
    }, error => {
      this.message = "Unable to get.";
    });
  }

  copyUrl(accountId: string) {
    let url = this.apiService.frontendUrl + '/qr-code?accountId=' + accountId;
    console.log(url);
    this._clipboardService.copyFromContent(url);
    setTimeout(() => {
      if (this.popover.isOpen())
        this.popover.close()
    }, 1000);
  }

  limitUpdate() {
    if (!this.accountsLimit) {
      this.message = "Please enter valid number.";
      return;
    }
    let userAccounts: UserAccounts[] = [];
    this.showSpinner = true;
    for (let i = 0; i < this.accountsLimit; i++) {
      let ua: UserAccounts = {
        accountId: uuidv4(),
        onBoard: false
      }
      userAccounts.push(ua);
      if ((i + 1) == this.accountsLimit) {
        this.apiService.setUsers({ userAccounts: userAccounts }).subscribe((data: any) => {
          this.showSpinner = false;
          if (data.status == "SUCCESS") {
            this.getData();
            this.accountsLimit = undefined;
          } else {
            this.message = data.message;
          }
        }, error => {
          this.showSpinner = false;
          this.message = "Unable to update.";
        });
      }
    }
  }

}

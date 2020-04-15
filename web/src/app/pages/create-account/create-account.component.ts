import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { APIService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent implements OnInit {
  accountId: string;
  isAccountExists = true;
  txs = [];

  createAccountForm: FormGroup;
  showSpinner: boolean = false;
  message = "";

  constructor(private activatedRoute: ActivatedRoute, private fb: FormBuilder, private apiService: APIService) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      console.log('queryParams', params);
      this.accountId = params['accountId'];
      if (this.accountId) {
        this.createAccountForm = this.fb.group({
          firstname: ['', Validators.required],
          lastname: ['', Validators.required],
          accountId: [this.accountId],
          status: ['Active']
        });
        this.getAccountData();
      }
    });
  }

  getAccountData() {
    this.apiService.getUserTxs({ accountId: this.accountId }).subscribe((data: any) => {
      if (data.status == "SUCCESS") {
        if (data.data) {
          this.isAccountExists = true;
          this.txs = data.data;
        } else {
          this.isAccountExists = false;
        }
      } else {
        this.apiService.handleError(data.message);
      }
    }, error => {
      this.apiService.handleError(error);
    });
  }

  createAccount() {
    if (this.createAccountForm.invalid) {
      this.message = "Please enter all fields.";
      return;
    }
    this.showSpinner = true;
    this.apiService.createUser(this.createAccountForm.value).subscribe((data: any) => {
      this.showSpinner = false;
      if (data.status == "SUCCESS") {
        this.getAccountData();
      } else {
        this.message = data.message;
      }
    }, error => {
      this.showSpinner = false;
      this.apiService.handleError(error);
    });
  }

}

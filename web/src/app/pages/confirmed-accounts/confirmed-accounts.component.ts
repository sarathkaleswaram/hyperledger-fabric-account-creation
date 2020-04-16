import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-confirmed-accounts',
  templateUrl: './confirmed-accounts.component.html',
  styleUrls: ['./confirmed-accounts.component.scss']
})
export class ConfirmedAccountsComponent implements OnInit {
  allUsers = [];

  constructor(private apiService: APIService) { }

  ngOnInit() {
    this.apiService.getAllUsers().subscribe((data: any) => {
      if (data.status == "SUCCESS") {
        this.allUsers = data.data;
      } else {
        this.apiService.handleError(data.message);
      }
    }, error => {
      this.apiService.handleError(error);
    });
  }

}

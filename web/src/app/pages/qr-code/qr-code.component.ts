import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss']
})
export class QRCodeComponent implements OnInit {

  url;

  constructor(private activatedRoute: ActivatedRoute, private apiService: APIService) {
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      console.log('queryParams', params);
      let accountId = params['accountId'];
      if (accountId) {
        this.url = this.apiService.frontendUrl + '/create-account?accountId=' + accountId;
        console.log("URL: ", this.url);
      }
    });
  }

  openLink() {
    window.open(this.url, "_blank");
  }

}

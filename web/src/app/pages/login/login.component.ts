import { Component, OnInit, OnDestroy } from '@angular/core';
import { APIService } from 'src/app/services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  
  loginForm: FormGroup;
  showSpinner: boolean = false;
  message = "";

  constructor(private router: Router, private fb: FormBuilder, private apiService: APIService) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnDestroy() {
  }

  login() {
    this.showSpinner = true;
    this.apiService.login(this.loginForm.value).subscribe((data: any) => {
      this.showSpinner = false;
      if (data.status == "SUCCESS") {
        localStorage.setItem("isLoggedIn", "true");
        this.router.navigate(["/dashboard"]);
      } else {
        this.message = data.message;
      }
    }, error => {
      this.showSpinner = false;
      this.message = "Unable to login.";
    });
  }

}

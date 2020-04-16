import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PlatformLocation } from '@angular/common';
import { Router } from '@angular/router';

export interface UserAccounts {
  accountId: string;
  onBoard: boolean;
  ccKey?: string;
}

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class APIService {
  url = "http://3.6.125.99:3003";
  frontendUrl = "";

  constructor(private http: HttpClient, public platformLocation: PlatformLocation, private router: Router) {
    this.frontendUrl = (platformLocation as any).location.origin;
    console.log("APIServer frontend URL: ", this.frontendUrl);
  }

  handleError(error) {
    alert(JSON.stringify(error));
  }

  logout() {
    console.log("Logout");
    localStorage.removeItem("isLoggedIn");
    this.router.navigate(["/login"]);
  }

  login(body) {
    return this.http.post(`${this.url}/login`, body, httpOptions);
  }

  getUsers() {
    return this.http.get(`${this.url}/getUsers`, httpOptions);
  }

  setUsers(body) {
    return this.http.post(`${this.url}/setUsers`, body, httpOptions);
  }

  getUserTxs(body) {
    return this.http.post(`${this.url}/getUserTxs`, body, httpOptions);
  }

  createUser(body) {
    return this.http.post(`${this.url}/createUser`, body, httpOptions);
  }

  getAllUsers() {
    return this.http.get(`${this.url}/getAllUsers`, httpOptions);
  }
}

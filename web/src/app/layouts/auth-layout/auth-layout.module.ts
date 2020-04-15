import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthLayoutRoutes } from './auth-layout.routing';
import { QRCodeComponent } from '../../pages/qr-code/qr-code.component';
import { QRCodeModule } from 'angularx-qrcode';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LoginComponent } from '../../pages/login/login.component';
import { CreateAccountComponent } from '../../pages/create-account/create-account.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AuthLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    QRCodeModule,
    // NgbModule
  ],
  declarations: [
    LoginComponent,
    CreateAccountComponent,
    QRCodeComponent
  ]
})
export class AuthLayoutModule { }

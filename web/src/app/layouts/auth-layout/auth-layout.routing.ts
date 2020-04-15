import { Routes } from '@angular/router';

import { LoginComponent } from '../../pages/login/login.component';
import { CreateAccountComponent } from '../../pages/create-account/create-account.component';
import { QRCodeComponent } from 'src/app/pages/qr-code/qr-code.component';

export const AuthLayoutRoutes: Routes = [
    { path: 'login',          component: LoginComponent },
    { path: 'create-account',       component: CreateAccountComponent },
    { path: 'qr-code',           component: QRCodeComponent }
];

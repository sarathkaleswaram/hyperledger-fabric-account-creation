import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TransactionsComponent } from '../../pages/transactions/transactions.component';
import { ConfirmedAccountsComponent } from '../../pages/confirmed-accounts/confirmed-accounts.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'transactions', component: TransactionsComponent },
    { path: 'confirmed-accounts', component: ConfirmedAccountsComponent },
    { path: 'icons', component: IconsComponent },
    { path: 'user-profile', component: UserProfileComponent },
];

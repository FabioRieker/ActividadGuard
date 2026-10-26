import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonCard,
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonItem, IonLabel, IonInput, IonButton, IonText, ToastController,
  IonIcon, IonButtons
} from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonContent, IonHeader, IonTitle, IonToolbar, IonCard,
    IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonItem, IonInput, IonButton, IonText, IonButtons
  ]
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastController = inject(ToastController);

  public username = '';
  public password = '';
  public errorMessage = '';

  public quickLogin(role: 'admin' | 'operador'): void {
    if (role === 'admin') {
      this.username = 'admin';
      this.password = '123';
    } else {
      this.username = 'operador';
      this.password = '123';
    }
    this.handleLogin();
  }

  public async handleLogin(): Promise<void> {
    this.errorMessage = '';
    const success = this.authService.login(this.username, this.password);

    if (success) {
      const user = this.authService.currentUser();
      const toast = await this.toastController.create({
        message: `¡Sesión iniciada con éxito! Bienvenido, ${user?.username} (Rol: ${user?.role}).`,
        duration: 2500,
        color: 'success',
        position: 'top',
        icon: 'checkmark-circle-outline'
      });
      await toast.present();

      if (user?.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/user-dashboard']);
      }
    } else {
      this.errorMessage = 'Credenciales no autorizadas. Use admin / 123 o operador / 123';
      const toast = await this.toastController.create({
        message: this.errorMessage,
        duration: 3000,
        color: 'danger',
        position: 'top',
        icon: 'alert-circle-outline'
      });
      await toast.present();
    }
  }
}

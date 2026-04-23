import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private styledSwal = Swal.mixin({
    customClass: {
      popup: 'custom-swal-popup',
      title: 'custom-swal-title',
      htmlContainer: 'custom-swal-text',
      confirmButton: 'custom-swal-btn custom-swal-confirm',
      cancelButton: 'custom-swal-btn custom-swal-cancel',
    },
    buttonsStyling: false 
  });

  success(title: string, text?: string) {
    this.styledSwal.fire({
      icon: 'success',
      title: title,
      text: text
    });
  }

  error(title: string, text?: string) {
    this.styledSwal.fire({
      icon: 'error',
      title: title,
      text: text
    });
  }

  async confirm(title: string, text: string, confirmBtnText: string = 'Igen'): Promise<boolean> {
    const result = await this.styledSwal.fire({
      title: title,
      text: text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmBtnText,
      cancelButtonText: 'Mégsem'
    });
    return result.isConfirmed; 
  }

  info(title: string, text?: string) {
    this.styledSwal.fire({
      icon: 'info',
      title: title,
      text: text
    });
  }

  toast(title: string, icon: 'success' | 'error' | 'info' | 'warning' = 'success') {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'custom-toast-popup'
      }
    });
  }
}
import { Component,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component'; 
import { HttpClient } from '@angular/common/http';
import { environment } from '../../core/enviroment';



@Component({
  selector: 'contact',
  standalone: true,
  imports: [HeaderComponent,CommonModule,ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {

  private fb = inject(FormBuilder);
  isSubmitted = false;

  contactForm = this.fb.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    bookingId: [''], 
    subject: ['refund'], 
    message: ['', Validators.required]
  });

  private http = inject(HttpClient);


onSubmit() {
    if (this.contactForm.valid) {
      this.http.post(`${environment.apiUrl}/contact`, this.contactForm.value).subscribe({
        next: () => {
          this.isSubmitted = true;
          this.contactForm.reset({ subject: 'refund' });
          setTimeout(() => this.isSubmitted = false, 3000);
        },
        error: (err) => {
          console.error('Hiba:', err);
          alert('Hiba történt az üzenet küldésekor!');
        }
      });
    } else {
      this.contactForm.markAllAsTouched();
    }
}
}


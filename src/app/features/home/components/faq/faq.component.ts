import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; 

@Component({
  selector: 'faq',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent {
  openIndex: number | null = null;

  faqItems = [
    {
      question: 'Hogyan működik a parkoló keresés?',
      answer: 'A keresőbe írja be a várost vagy a címet, válassza ki az időpontot, és rendszerünk listázza az elérhető helyeket.'
    },
    {
      question: 'Biztonságos a fizetés?',
      answer: 'Igen, a fizetés a Stripe biztonságos rendszerén keresztül történik, bankkártyaadatait nem tároljuk.'
    },
    {
      question: 'Lemondhatom a foglalást?',
      answer: 'Igen, a foglalás a kezdés előtt legalább 1 órával díjmentesen lemondható a Profilom / Foglalásaim menüpont alatt.'
    }
  ];

  toggleFaq(index: number) {
    if (this.openIndex === index) {
      this.openIndex = null; 
    } else {
      this.openIndex = index; 
    }
  }
}
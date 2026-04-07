import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalErrorComponent } from './shared/components/global-error/global-error.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,GlobalErrorComponent],
  templateUrl: './app.component.html',

})
export class App {
  protected readonly title = signal('vizsgaremek');
}

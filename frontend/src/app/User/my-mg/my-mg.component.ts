import { Component } from '@angular/core';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-my-mg',
  standalone: true,
  imports: [NavBarComponent, FooterComponent],
  templateUrl: './my-mg.component.html',
  styleUrl: './my-mg.component.css'
})
export class MyMgComponent {

}

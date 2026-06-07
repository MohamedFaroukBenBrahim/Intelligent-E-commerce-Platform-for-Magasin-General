import { Component } from '@angular/core';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { FooterComponent } from "../footer/footer.component";
import { ContactService } from '../../Services/Contact/contact.service';
import { contact } from '../../Model/contact.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [NavBarComponent, FooterComponent,FormsModule,CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  constructor(private contact_service:ContactService,private router: Router){}
  contactmessage:contact ={
    id: 0,
    name: '',
    email: '',
    subject: '',
    message: ''
  }
  addcontactmessage(){
    this.contact_service.sendcontact(this.contactmessage).subscribe({
      next: (res) =>{
        console.log("SENT", res)
        alert('Thank you for sending your Feedback !')
        this.router.navigate(['/'])
      },
      error: (err) =>{
        console.log(err)
      }
    })

  }

}

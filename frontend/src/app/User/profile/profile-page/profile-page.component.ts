import { Component, OnInit } from '@angular/core';
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
import { FooterComponent } from "../../footer/footer.component";
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { UserService } from '../../../Services/User/user.service';
import { profile } from '../../../Model/profiel.model';
import { ProfileSidebarComponent } from "../profile-sidebar/profile-sidebar.component";
import { ProfielEdit } from '../../../Model/pofieledit.model';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [NavBarComponent, FooterComponent, CommonModule, FormsModule, ProfileSidebarComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {
  showSuccessAlert = false;
  showErrorAlert = false;
  constructor(private user_service:UserService){}
  me:ProfielEdit={
    username: '',
    address: '',
    phone: '',
  }

  ngOnInit(): void {
    this.user_service.getme().subscribe({
      next: (res)=>{
        this.me = res
      },
      error: (res)=>{
        console.log("ERROR LOADING PROFILE")
      }
    })
  }
  updateprofile(){
    this.user_service.updateprofiel(this.me).subscribe( {
      next: (res)=>{
        console.log("WORKED");
        this.showSuccessAlert =true;
        setTimeout(() => this.showSuccessAlert = false, 5000);
        this.ngOnInit();
      },
      error: (err)=>{
        this.showErrorAlert =true;
        setTimeout(() => this.showErrorAlert = false, 5000);
        console.log("ERROR updating profile picture", err);
      }
    })
  }
}

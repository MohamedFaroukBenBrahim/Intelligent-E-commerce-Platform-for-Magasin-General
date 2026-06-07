import { Component, OnInit } from '@angular/core';
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { contact } from '../../Model/contact.model';
import { ContactService } from '../../Services/Contact/contact.service';

@Component({
  selector: 'app-admin-contact',
  standalone: true,
  imports: [AdminSidebarComponent,FormsModule,CommonModule],
  templateUrl: './admin-contact.component.html',
  styleUrl: './admin-contact.component.css'
})
export class AdminContactComponent implements OnInit {
  constructor(private contact_service:ContactService){}
  contacts: contact [] = []
  searchText: string = '';
  selectedReadStatus: string = 'all';
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  
  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    let readFilter: boolean | undefined;
    if (this.selectedReadStatus === 'read') {
      readFilter = true;
    } else if (this.selectedReadStatus === 'unread') {
      readFilter = false;
    }

    this.contact_service.getcontacts(
      this.searchText || undefined,
      readFilter,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (res: any) => {
        this.contacts = res.content;
        this.totalPages = res.totalPages;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  search(): void {
    this.currentPage = 0;
    this.loadContacts();
  }

  delete(id:number){
    if (!window.confirm("Are you sure you want to delete ?")) {
      return;
    }
    this.contact_service.deletecontacts(id).subscribe({
      next: (res)=>{
        console.log(res)
        this.loadContacts();
      },
      error: (err)=>{
        console.log(err)
      }
    })
  }
  read(id:number){
    this.contact_service.readcontacts(id).subscribe({
      next:(res)=>{
        console.log(res)
        this.loadContacts();
      },
      error:(err)=>{
        console.log(err)
      }
    })
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-oauth2-redirect',
  standalone: true,
  imports: [],
  templateUrl: './oauth2-redirect.component.html',
  styleUrl: './oauth2-redirect.component.css'
})
export class Oauth2RedirectComponent implements OnInit {

  constructor( private route: ActivatedRoute,private router: Router) {}

  ngOnInit() {
    // Get token from URL query parameter
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      
      if (token) {
        // Save token to localStorage
        localStorage.setItem('token', token);
        console.log('Google login successful!');
        
        // Redirect to home page
        this.router.navigate(['']);
      } else {
        console.error('No token received');
        this.router.navigate(['/login']);
      }
    });
  }
}

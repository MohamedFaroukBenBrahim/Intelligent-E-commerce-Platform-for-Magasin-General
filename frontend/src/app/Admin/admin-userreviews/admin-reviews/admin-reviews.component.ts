import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from "../../admin-sidebar/admin-sidebar.component";
import { ReviewsService } from '../../../Services/reviews/reviews.service';
import { review } from '../../../Model/review.model';


@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent, FormsModule],
  templateUrl: './admin-reviews.component.html',
  styleUrl: './admin-reviews.component.css'
})
export class AdminReviewsComponent implements OnInit {

  reviews: review[] = [];
  isLoading = true;
  deletingId: number | null = null;
  searchtext = '';
  selectedRating: string = 'all';
  ratingOptions = [1, 2, 3, 4, 5];

  constructor(private reviewService: ReviewsService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;
    const params: { [param: string]: string | number | boolean } = {};
    const keyword = this.searchtext.trim();

    if (keyword) {
      params['keyword'] = keyword;
    }

    if (this.selectedRating !== 'all') {
      params['rating'] = Number(this.selectedRating);
    }

    this.reviewService.getallreviews(params).subscribe({
      next: (res) => {
        this.reviews = res.content;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  search(): void {
    this.loadReviews();
  }

  deleteReview(id: number): void {
    if (!confirm('Are you sure you want to delete this review?')) return;
    this.deletingId = id;
    this.reviewService.deleteReview(id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== id);
        this.deletingId = null;
      },
      error: (err) => {
        console.error('ERROR deleting review', err);
        this.deletingId = null;
      }
    });
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }
}
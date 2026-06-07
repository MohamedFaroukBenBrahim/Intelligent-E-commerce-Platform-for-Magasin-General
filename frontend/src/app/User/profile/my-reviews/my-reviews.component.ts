import { Component, OnInit } from '@angular/core';
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
import { ProfileSidebarComponent } from "../profile-sidebar/profile-sidebar.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReviewsService } from '../../../Services/reviews/reviews.service';
import { review } from '../../../Model/review.model';
import { FooterComponent } from "../../footer/footer.component";

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [NavBarComponent, ProfileSidebarComponent, FormsModule, CommonModule, FooterComponent],
  templateUrl: './my-reviews.component.html',
  styleUrl: './my-reviews.component.css'
})
export class MyReviewsComponent implements OnInit {
  constructor(private review_service: ReviewsService) {}
  
  loading = true;
  myReviewList: review[] = [];
  editingReviewId: number | null = null;
  editingReview: review | null = null;
  hoveredEditStar = 0;
  savingId: number | null = null;
  deletingId: number | null = null;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';

  ngOnInit(): void {
    this.review_service.myreviews().subscribe({
      next: (res) => {
        this.myReviewList = res;
        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      }
    });
  }

  startEdit(item: review): void {
    if (!item.id) {
      return;
    }

    this.editingReviewId = item.id;
    this.editingReview = { ...item };
    this.hoveredEditStar = 0;
    this.feedbackMessage = '';
    this.feedbackType = '';
  }

  cancelEdit(): void {
    this.editingReviewId = null;
    this.editingReview = null;
    this.hoveredEditStar = 0;
  }

  saveReview(): void {
    if (!this.editingReviewId || !this.editingReview) {
      return;
    }

    this.savingId = this.editingReviewId;

    this.review_service.updateReview(this.editingReviewId, this.editingReview).subscribe({
      next: () => {
        this.myReviewList = this.myReviewList.map((item) =>
          item.id === this.editingReviewId ? { ...this.editingReview! } : item
        );
        this.feedbackMessage = 'Review updated successfully.';
        this.feedbackType = 'success';
        this.cancelEdit();
      },
      error: (err) => {
        console.log(err);
        this.feedbackMessage = 'Could not save the review. Please try again.';
        this.feedbackType = 'error';
      },
      complete: () => {
        this.savingId = null;
      }
    });
  }

  deleteReview(id: number): void {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    this.deletingId = id;

    this.review_service.deleteReview(id).subscribe({
      next: () => {
        this.myReviewList = this.myReviewList.filter((item) => item.id !== id);
        this.feedbackMessage = 'Review deleted successfully.';
        this.feedbackType = 'success';
      },
      error: (err) => {
        console.log(err);
        this.feedbackMessage = 'Could not delete the review. Please try again.';
        this.feedbackType = 'error';
      },
      complete: () => {
        this.deletingId = null;
      }
    })
  }

  getStars(rating: number): number[] {
    return Array(Math.min(5, Math.max(0, Math.round(rating)))).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.min(5, Math.max(0, Math.round(rating)))).fill(0);
  }

  getReviews(): review[] {
    return [...this.myReviewList].reverse();
  }
}

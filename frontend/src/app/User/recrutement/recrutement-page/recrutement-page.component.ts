import { Component } from '@angular/core';
import { FooterComponent } from "../../footer/footer.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecrutementService } from '../../../Services/recrutement/recrutement.service';
import { JobOfferResponseDto } from '../../../Model/JobOfferResponse.model';
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recrutement-page',
  standalone: true,
  imports: [FooterComponent, CommonModule, FormsModule, NavBarComponent, RouterLink],
  templateUrl: './recrutement-page.component.html',
  styleUrl: './recrutement-page.component.css'
})
export class RecrutementPageComponent {

  constructor(private recrutement_service: RecrutementService) {}

  recommandation: any[] = [];
  userID: number = 0;
  hasCv: boolean = false;
  currentCarouselIdx: number = 0;
  touchStartX: number = 0;
  carouselLoadingRec: boolean = false;
  loadingRecommendations: boolean = false;
  recError: string = '';

  allJobOffers: JobOfferResponseDto[] = [];  // full list
  listJobOffers: JobOfferResponseDto[] = []; // paginated + filtered
  searchtext: string = '';
  loading: boolean = true;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;

  ngOnInit(): void {
    this.getJobs();
    this.getUserProfile();
  }

  getJobs(): void {
    this.recrutement_service.getAllOffersActive().subscribe({
      next: (res) => {
        this.allJobOffers = res.content;
        this.loading = false;
        this.applyFilters();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }


  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    const query = this.searchtext.toLowerCase().trim();
    const filtered = query
      ? this.allJobOffers.filter(job =>
          job.title?.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query) ||
          job.contractType?.toLowerCase().includes(query) ||
          job.requiredSkills?.toLowerCase().includes(query)
        )
      : [...this.allJobOffers];

    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;

    const start = (this.currentPage - 1) * this.pageSize;
    this.listJobOffers = filtered.slice(start, start + this.pageSize);
  }

  // ─── Pagination

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    const delta = 2;
    for (let i = 1; i <= this.totalPages; i++) {
      if (
        i === 1 ||
        i === this.totalPages ||
        (i >= this.currentPage - delta && i <= this.currentPage + delta)
      ) {
        pages.push(i);
      }
    }
    return pages;
  }

  showEllipsisBefore(page: number, index: number, pages: number[]): boolean {
    return index > 0 && page - pages[index - 1] > 1;
  }

  // ─── Profile & Recommendations ──────────────────────────

  getUserProfile(): void {
    this.loadingRecommendations = true;
    this.recrutement_service.getmyprofile().subscribe({
      next: (res) => {
        this.userID = res.id;
        this.hasCv = !!res.cvUrl; // adjust to your actual field name
        if (this.hasCv) {
          this.getRecommandation();
        } else {
          this.loadingRecommendations = false;
        }
      },
      error: (err) => {
        console.error('Profile error:', err);
        this.hasCv = false;
        this.loadingRecommendations = false;
      }
    });
  }

  getRecommandation(): void {
    this.carouselLoadingRec = true;
    this.loadingRecommendations = true;
    this.recError = '';
    this.recommandation = [];
    this.recrutement_service.getRecomandation(this.userID).subscribe({
      next: (res) => {
        this.recommandation = res;
        this.carouselLoadingRec = false;
        this.loadingRecommendations = false;
      },
      error: (err) => {
        console.error('Recommendations error:', err);
        this.recError = err?.error?.message || 'Unable to load recommendations. Please try again later.';
        this.carouselLoadingRec = false;
        this.loadingRecommendations = false;
      }
    });
  }

  // ─── Carousel 

  nextCarousel(): void {
    if (this.currentCarouselIdx < this.recommandation.length - 1) {
      this.currentCarouselIdx++;
    }
  }

  prevCarousel(): void {
    if (this.currentCarouselIdx > 0) {
      this.currentCarouselIdx--;
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    const diff = this.touchStartX - event.changedTouches[0].clientX;
    if (diff > 50) this.nextCarousel();
    else if (diff < -50) this.prevCarousel();
  }

  // ─── Helpers ────────────────────────────────────────────

  getSkills(skills: string): string[] {
    if (!skills) return [];
    return skills.split(',').map(s => s.trim()).filter(s => s);
  }

  getTimeAgo(dateStr: string): string {
    const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted yesterday';
    return `Posted ${diffDays} days ago`;
  }
}
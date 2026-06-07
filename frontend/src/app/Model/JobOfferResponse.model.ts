export interface JobOfferResponseDto {
  id: number;
  title: string;
  description: string;
  location: string;
  contractType: string;
  requiredSkills: string;
  active: boolean;
  postedAt: string;
  updatedAt: string;
  postedByUsername: string;
  applicationCount: number;
}
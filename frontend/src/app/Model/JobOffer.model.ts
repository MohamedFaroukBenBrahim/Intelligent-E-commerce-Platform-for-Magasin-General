export interface JobOfferDto {
  title: string;
  description: string;
  location: string;
  contractType: string;
  requiredSkills: string;
  active?: boolean;
}

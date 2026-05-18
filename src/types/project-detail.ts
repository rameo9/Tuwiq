export type SerializedProject = {
  id: number;
  titleAr: string;
  titleEn: string;
  locationAr: string;
  locationEn: string;
  descriptionAr: string;
  descriptionEn: string;
  area: string;
  units: string;
  status: string;
  categoryAr: string;
  categoryEn: string;
  mainImageUrl: string;
  pdfUrl: string | null;
  completionYear: string;
  images: { url: string; sortOrder: number }[];
  features: { textAr: string; textEn: string; sortOrder: number }[];
};

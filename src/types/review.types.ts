
export interface Review {
  id: string;
  appointment_id: string;
  rating: number; // 1-5 stars
  comment: string | null;
  created_at: string;
}

export interface ReviewFormData {
  rating: number;
  comment?: string;
}

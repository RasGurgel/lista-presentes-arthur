export interface Gift {
  id: string;
  created_at: string;
  name: string;
  shopee_url: string;
  image_url: string | null;
  price: number | null;
  claimer_name: string | null;
  claimer_note: string | null;
  claimed_at: string | null;
  is_purchased: boolean;
}
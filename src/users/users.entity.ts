export default interface User {
  id: number;
  user_id: string;
  public_key: string;
  private_key: string;
  favs: string[];
  categories: string[];
  created_at: Date;
}

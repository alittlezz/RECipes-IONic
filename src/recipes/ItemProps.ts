export interface ItemProps {
  _id?: string;
  name: string;
  description: string;
  isGood: boolean;
  calories: string;
  photo: string;
  lat: number;
  lng: number;
  userId?: string;
  version?: number;
}

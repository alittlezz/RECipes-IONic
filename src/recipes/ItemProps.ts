export interface ItemProps {
  _id?: string;
  name: string;
  description: string;
  isGood: boolean;
  calories: string;
  photo: string;
  userId?: string;
  version?: number;
}

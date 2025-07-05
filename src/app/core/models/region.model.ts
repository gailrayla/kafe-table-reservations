export interface Region {
  id: string;
  name: string;
  maxSize: number;
  childrenAllowed: boolean;
  smokingAllowed: boolean;
}

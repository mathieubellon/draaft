export type Channel = {
  id: number;
  name: string;
  level: number;
  children: Channel[];
  hierarchy: string;
}
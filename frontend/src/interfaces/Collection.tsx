import { Field } from "./Field";

export interface Collectible{
  id: number,
  pictureid: number,
  name: string,
  description: string
  data: any
}

export interface Collection{
  name: string,
  description: string,
  pictureid: number,
  id: number,
  template: Field[],
  owner: number
  collectibles: Collectible[]
}
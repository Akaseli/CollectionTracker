import { Field } from "./Field";

export interface Collection{
  name: string,
  description: string,
  pictureid: number,
  id: number,
  template: Field[],
  owner: number
}
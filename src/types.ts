export type Ingredient = {
  name: string;
  quantity: string;
};

export type Recipe = {
  id?: number;
  title: string;
  description: string;
  ingredients: Ingredient[];
};

import { recipe, recipe2 } from "./recipe";

export const productionItems = [
  {
    objectId: "pI01",
    recipe,
    expectedProduction: 100
  },
  // {
  //   objectId: "pI02",
  //   recipe,
  //   expectedProduction: 200
  // },

  {
    objectId: "pI02",
    recipe: recipe2,
    expectedProduction: 800
  },
  // {
  //   objectId: "3",
  //   recipe: recipe2,
  //   expectedProduction: 400
  // },
  // {
  //   objectId: "04",
  //   recipe: recipe2,
  //   expectedProduction: 400
  // }
];

import { productionItems } from "../data/productionItem";
import { computeProductionStepData } from "./recipeUtils";
import { cloneDeep } from "lodash";

const mergedMaps = (...maps) => {
  const dataMap = new Map();

  for (const map of maps) {
    for (const [key, value] of map) {
      dataMap.set(key, value);
    }
  }

  return dataMap;
};

const getProductionStepExecutionsToSave = (productionSteps = []): any => {
  const productionStepExecutions = [];
  let priorStepsMap = new Map();

  for (const productionStepObj of productionSteps) {
    const type = !!(productionStepObj as any).step
      ? "fromRecipe"
      : "fromReusableSteps";

    const productionStep =
      type === "fromRecipe"
        ? (productionStepObj as any).step
        : productionStepObj;

    if (productionStep.productionSteps) {
      const {
        productionStepExecutions: subProductionStepExecutions,
        priorStepsMap: subPriorStepsMap
      } = getProductionStepExecutionsToSave(productionStep.productionSteps);
      productionStepExecutions.push(...subProductionStepExecutions);
      priorStepsMap = mergedMaps(priorStepsMap, subPriorStepsMap);
    } else {
      const productionStepExecution: any = {
        productionStep // pointer
      };
      const priorSteps = []; // pointers

      if (productionStep.stepComponents) {
        for (const stepComponent of productionStep.stepComponents) {
          if (stepComponent.priorSteps) {
            const productionStep = stepComponent.priorSteps;

            // const priorProductionStepExecution = new ProductionStepExecution()
            const priorProductionStepExecution: any = productionStep;

            // .save()
            const newPriorProductionStepExecution = priorProductionStepExecution;
            priorSteps.push(newPriorProductionStepExecution);
          }
        }
      }

      // the prior steps should be the ulterior step of the current step
      if (priorSteps?.length > 0) {
        productionStepExecution.status = "LOCKED";
        productionStepExecution.priorSteps = priorSteps;
        for (const priorStep of priorSteps) {
          priorStepsMap.set(priorStep.index, productionStep);
        }
      } else {
        productionStepExecution.status = "TODO";
      }

      if (type === "fromRecipe") {
        if (productionStepObj.reusable) {
          if (productionStepObj.coeff !== null) {
            productionStepExecution.netWeight = productionStepObj.coeff;
          } else {
            productionStepExecution.netWeight = productionStepObj.netWeight;
          }
        } else {
          const newStep = cloneDeep(productionStep);
          computeProductionStepData(newStep);
          productionStepExecution.netWeight = newStep.netWeight;
          productionStepExecution.grossWeight = newStep.grossWeight;
        }
      } else {
        const newStep = cloneDeep(productionStepObj);
        computeProductionStepData(newStep);
        productionStepExecution.netWeight = newStep.netWeight;
        productionStepExecution.grossWeight = newStep.grossWeight;
      }
      // .save()
      // await productionStepExecution.save()
      productionStepExecutions.push(productionStepExecution);
    }
  }

  return {
    productionStepExecutions,
    priorStepsMap
  };
};

export const createProductionStepExecutions3 = () => {
  let productionStepExecutions = [];

  for (const productionItem of productionItems) {
    const recipeProductionStepExecutions = [];
    for (const section of productionItem.recipe.sections) {
      const productionStepExecutions = getProductionStepExecutionsToSave(
        (section as any).productionSteps
      );
      recipeProductionStepExecutions.push(productionStepExecutions);
    }
    productionStepExecutions.push(recipeProductionStepExecutions);
  }

  return productionStepExecutions;
};

const formatSectionProductionStepExecutions = (
  productionItems,
  recipe,
  section,
  productionStepExecutions,
  priorStepsMap,
  expectedProductions
) => {
  const newProductionStepExecutions = productionStepExecutions.map(
    (productionStepExecution) => {
      console.log("productionStepExecution", productionStepExecution);
      const newProductionStepExecution = {
        ...productionStepExecution,
        recipe, // current recipe
        // all production items with the same production date and recipe
        // productionItems: productionItems.filter(
        //   (productionItem) => productionItem.recipe.objectId === recipe.objectId
        // ),
        productionItems,
        section
        // theoreticalNetWeight: expectedProductions *
      };

      const ulteriorStep = priorStepsMap.get(
        productionStepExecution.productionStep.index
      );

      if (ulteriorStep) {
        newProductionStepExecution.ulteriorStep = ulteriorStep;
      }

      return newProductionStepExecution;
    }
  );

  return newProductionStepExecutions;
};

const getProductionItemsByRecipe = (productionItemsByDate, productionItem) => {
  const productionItemsByRecipe = [];
  let expectedProductions = 0;
  for (const productionItemByDate of productionItemsByDate) {
    if (productionItemByDate.recipe.id === productionItem.recipe.id) {
      productionItemsByRecipe.push(productionItemByDate);
      expectedProductions += productionItemByDate.expectedProduction;
    }
  }

  return {
    productionItemsByRecipe,
    expectedProductions
  };
};
export const createProductionStepExecutions = () => {
  let productionStepExecutions = [];

  for (const productionItem of productionItems) {
    const {
      productionItemsByRecipe,
      expectedProductions
    } = getProductionItemsByRecipe(productionItems, productionItem);

    for (const section of productionItem.recipe.sections) {
      const productionStepExecutionsToSave = getProductionStepExecutionsToSave(
        (section as any).productionSteps
      );

      const sectionProductionStepExecutions = formatSectionProductionStepExecutions(
        productionItemsByRecipe,
        productionItem.recipe,
        section,
        productionStepExecutionsToSave.productionStepExecutions,
        productionStepExecutionsToSave.priorStepsMap,
        expectedProductions
      );

      productionStepExecutions = [
        ...productionStepExecutions,
        ...sectionProductionStepExecutions
      ];
    }
  }

  return productionStepExecutions;
};

// export const createProductionStepExecutions = () => {
//   let productionStepExecutions = [];

//   for (const productionItem of productionItems) {
//     const newSections =  []
//     for (const section of productionItem.recipe.sections) {
//       const productionStepExecutionsToSave = getProductionStepExecutionsToSave(
//         (section as any).productionSteps
//       );

//       const sectionProductionStepExecutions = formatSectionProductionStepExecutions(
//         productionItems,
//         productionItem,
//         section,
//         productionStepExecutionsToSave.productionStepExecutions,
//         productionStepExecutionsToSave.priorStepsMap
//       );
//       console.log("ulteriorStep 2", productionStepExecutionsToSave.priorStepsMap.get(
//         "df1d234f-ddb9-434a-8be6-834f19786ed6"
//       ))

//       // productionStepExecutions = sectionProductionStepExecutions
//       newSections.push(sectionProductionStepExecutions)
//     }

//     productionStepExecutions.push(...newSections)
//   }

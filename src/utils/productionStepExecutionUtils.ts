import { productionItems } from "../data/productionItem";

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
    const productionStep = (productionStepObj as any).step ?? productionStepObj;

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

export const createProductionStepExecution3 = () => {
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

const getSectionProductionStepExecutions = (
  productionItems,
  recipe,
  section,
  productionStepExecutions,
  priorStepsMap
) => {
  const newProductionStepExecutions = productionStepExecutions.map(
    (productionStepExecution) => {
      const newProductionStepExecution = {
        ...productionStepExecution,
        recipe, // current recipe
        // all production items with the same production date and recipe
        productionItems: productionItems.filter(
          (productionItem) => productionItem.recipe.objectId === recipe.objectId
        ),
        section
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

export const createProductionStepExecution = () => {
  let productionStepExecutions = [];

  for (const productionItem of productionItems) {
    for (const section of productionItem.recipe.sections) {
      const productionStepExecutionsToSave = getProductionStepExecutionsToSave(
        (section as any).productionSteps
      );

      const sectionProductionStepExecutions = getSectionProductionStepExecutions(
        productionItems,
        productionItem.recipe,
        section,
        productionStepExecutionsToSave.productionStepExecutions,
        productionStepExecutionsToSave.priorStepsMap
      );

      productionStepExecutions = [
        ...productionStepExecutions,
        ...sectionProductionStepExecutions
      ];
    }
  }

  return productionStepExecutions;
};

// export const createProductionStepExecution = () => {
//   let productionStepExecutions = [];

//   for (const productionItem of productionItems) {
//     const newSections =  []
//     for (const section of productionItem.recipe.sections) {
//       const productionStepExecutionsToSave = getProductionStepExecutionsToSave(
//         (section as any).productionSteps
//       );

//       const sectionProductionStepExecutions = getSectionProductionStepExecutions(
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

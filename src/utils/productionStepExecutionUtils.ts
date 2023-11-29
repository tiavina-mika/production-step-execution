import { productionItems } from "../data/productionItem";

const getProductionStepExecutionsToSave = (productionSteps = []): any => {
  const productionStepExecutions = [];
  const priorStepMap = new Map();

  for (const productionStepObj of productionSteps) {
    const productionStep = (productionStepObj as any).step ?? productionStepObj;
    // console.log("productionStep",
    // productionStep.name, "-",
    // productionStep);

    if (productionStep.productionSteps) {
      // console.log("productionStep", index, ": ", productionStep.name, "-", productionStep);

      const {
        productionStepExecutions: subProductionStepExecutions
      } = getProductionStepExecutionsToSave(productionStep.productionSteps);
      productionStepExecutions.push(...subProductionStepExecutions);
    } else {
      // console.log("productionStep 2", index, ": ", productionStep.name, "-", productionStep);

      const productionStepExecution: any = {
        productionStep // pointer
      };
      const priorSteps = []; // pointers

      if (productionStep.stepComponents) {
        for (const stepComponent of productionStep.stepComponents) {
          if (stepComponent.priorSteps) {
            const productionStep = stepComponent.priorSteps;
            // console.log("productionStep priors", productionStep.name);

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
          priorStepMap.set(priorStep.index, productionStep);
        }
      } else {
        productionStepExecution.status = "TODO";
      }

      // .save()
      // await productionStepExecution.save()
      productionStepExecutions.push(productionStepExecution);
    }
  }

  // return productionStepExecutions;
  return {
    productionStepExecutions,
    priorStepMap
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
  productionItem,
  section,
  productionStepExecutions,
  priorStepMap
) => {
  const newProductionStepExecutions = productionStepExecutions.map(
    (productionStepExecution) => {
      const newProductionStepExecution = {
        ...productionStepExecution
        // productionItem, // current productionItem
        // productionItems, // all production items with the same production date and recipe
        // section,
      };

      const ulteriorStep = priorStepMap.get(
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
      // priorStepMap
      productionStepExecutions = getSectionProductionStepExecutions(
        productionItems,
        productionItem,
        section,
        productionStepExecutionsToSave.productionStepExecutions,
        productionStepExecutionsToSave.priorStepMap
        // priorStepMap
      );
    }
  }

  return productionStepExecutions;
};

import { productionItems } from "../data/productionItem";

const getProductionStepExecutions = (
  productionSteps = [],
  parentIndex = null
): any => {
  const productionStepExecutions = [];

  for (const [index, productionStepObj] of (productionSteps as any).entries()) {
    const productionStep = (productionStepObj as any).step ?? productionStepObj;
    // console.log("productionStep",
    // productionStep.name, "-",
    // productionStep);

    if (productionStep.productionSteps) {
      // console.log("productionStep", index, ": ", productionStep.name, "-", productionStep);

      productionStepExecutions.push(
        ...getProductionStepExecutions(productionStep.productionSteps, index)
      );
    } else {
      // console.log("productionStep 2", index, ": ", productionStep.name, "-", productionStep);

      const productionStepExecution: any = {
        order: parentIndex ? parentIndex + index : index,
        productionStep
        // productionItems: productionItems,
        // recipe,
        // section
      };
      const priorSteps = [];

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
            // newPriorProductionStepExecution.priorSteps = priorSteps
            // productionStepExecutions.push(newPriorProductionStepExecution);
          }
        }
      }

      productionStepExecution.priorSteps = priorSteps;

      // if (priorSteps.length > 0) {
      //   productionStepExecution.status = "LOCKED";
      // } else {
      //   productionStepExecution.status = "TODO";
      // }
      // .save()
      // await productionStepExecution.save()
      productionStepExecutions.push(productionStepExecution);
    }
  }

  return productionStepExecutions;
};

export const createProductionStepExecution2 = () => {
  let productionStepExecutions = [];

  for (const productionItem of productionItems) {
    for (const section of productionItem.recipe.sections) {
      productionStepExecutions = getProductionStepExecutions(
        productionItem.recipe,
        section,
        (section as any).productionSteps
      );
    }
  }

  return productionStepExecutions;
};

export const createProductionStepExecution3 = () => {
  let productionStepExecutions = [];

  for (const productionItem of productionItems) {
    const recipeProductionStepExecutions = [];
    for (const section of productionItem.recipe.sections) {
      const productionStepExecutions = getProductionStepExecutions(
        productionItem.recipe,
        section,
        (section as any).productionSteps
      );
      recipeProductionStepExecutions.push(productionStepExecutions);
    }
    productionStepExecutions.push(recipeProductionStepExecutions);
  }

  return productionStepExecutions;
};

const getRecipeProductionStepExecutions = (
  productionItems,
  productionItem,
  section,
  productionStepExecutions
) => {
  const newProductionStepExecutions = productionStepExecutions.map(
    (productionStepExecution, index) => {
      const newProductionStepExecution = {
        ...productionStepExecution,
        productionItem,
        productionItems,
        section
      };

      const ulteriorStep = productionStepExecutions[index + 1];
      if (ulteriorStep) {
        // pointer
        newProductionStepExecution.ulteriorStep = ulteriorStep.productionStep;
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
      const recipeProductionStepExecutions = getProductionStepExecutions(
        (section as any).productionSteps
      );

      productionStepExecutions = getRecipeProductionStepExecutions(
        productionItems,
        productionItem,
        section,
        recipeProductionStepExecutions
      );
    }
  }

  return productionStepExecutions;
};

// order, section, recipe
import { productionItems } from "../data/productionItem";

const getProductionStepExecutions = (
  recipe,
  section,
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
        ...getProductionStepExecutions(
          recipe,
          section,
          productionStep.productionSteps,
          index
        )
      );
    } else {
      // console.log("productionStep 2", index, ": ", productionStep.name, "-", productionStep);

      const productionStepExecution: any = {
        order: parentIndex ? parentIndex + index : index,
        productionStep: { step: productionStep },
        productionItems: productionItems,
        recipe,
        section
      };
      const priorSteps = [];

      if (productionStep.stepComponents) {
        for (const stepComponent of productionStep.stepComponents) {
          if (stepComponent.priorSteps) {
            const productionStep = stepComponent.priorSteps;
            // console.log("productionStep priors", productionStep.name);

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

      if (priorSteps.length > 0) {
        productionStepExecution.status = "LOCKED";
      } else {
        productionStepExecution.status = "TODO";
      }
      // .save()
      // await productionStepExecution.save()
      productionStepExecutions.push(productionStepExecution);
    }
  }

  return productionStepExecutions;
};

export const createProductionStepExecution = () => {
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

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

      const productionStepExecution: any = {};
      productionStepExecution.order = parentIndex ? parentIndex + index : index;
      productionStepExecution.productionStep = { step: productionStep };
      productionStepExecution.productionItems = productionItems;
      const priorSteps = [];

      if (productionStep.stepComponents) {
        for (const stepComponent of productionStep.stepComponents) {
          if (stepComponent.priorSteps) {
            const productionStep = stepComponent.priorSteps;
            // console.log("productionStep priors", productionStep.name);

            const priorProductionStepExecution: any = {};
            priorProductionStepExecution.productionStep = {
              step: productionStep
            };
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
        (section as any).productionSteps
      );
    }
  }

  return productionStepExecutions;
};

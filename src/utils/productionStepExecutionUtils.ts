import { productionItems } from "../data/productionItem";

export const createProductionStepExecution = () => {
  const productionStepExecutions = [];

  for (const productionItem of productionItems) {
    for (const section of productionItem.recipe.sections) {
      for (const productionStepObj of section.productionSteps) {
        const productionStep = productionStepObj.step;
        console.log("productionStep", productionStep.name);
        const productionStepExecution: any = {};
        productionStepExecution.productionStep = { productionStep };
        productionStepExecution.productionItems = productionItems;
        const priorSteps = [];

        if (productionStep.stepComponents) {
          for (const stepComponent of productionStep.stepComponents) {
            if (stepComponent.priorSteps) {
              const productionStep = stepComponent.priorSteps;
              console.log("productionStep priors", productionStep.name);

              const priorProductionStepExecution: any = {};
              priorProductionStepExecution.productionStep = { productionStep };
              // .save()
              const newPriorProductionStepExecution = priorProductionStepExecution;
              priorSteps.push(newPriorProductionStepExecution);
              // newPriorProductionStepExecution.priorSteps = priorSteps
              productionStepExecutions.push(newPriorProductionStepExecution);
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
  }

  return productionStepExecutions;
};

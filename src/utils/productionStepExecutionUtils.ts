// @ts-nocheck

const mergedMaps = (...maps) => {
  const dataMap = new Map();

  for (const map of maps) {
    for (const [key, value] of map) {
      dataMap.set(key, value);
    }
  }

  return dataMap;
};

const getProductionStepExecutionsToSave = (productionSteps = []) => {
  const productionStepExecutions = [];
  let priorStepsMap = new Map();

  for (const productionStepObj of productionSteps) {
    const type = !!productionStepObj.step ? "fromRecipe" : "fromReusableSteps";

    const productionStep =
      type === "fromRecipe" ? productionStepObj.step : productionStepObj;

    if (productionStep.productionSteps) {
      const {
        productionStepExecutions: subProductionStepExecutions,
        priorStepsMap: subPriorStepsMap
      } = getProductionStepExecutionsToSave(productionStep.productionSteps);

      productionStepExecutions.push(...subProductionStepExecutions);

      // add the current map with the previous map
      priorStepsMap = mergedMaps(priorStepsMap, subPriorStepsMap);
    } else {
      const productionStepExecution = {
        productionStep // pointer
      };
      const priorSteps = []; // pointers

      if (productionStep.stepComponents) {
        for (const stepComponent of productionStep.stepComponents) {
          if (stepComponent.priorSteps) {
            priorSteps.push(stepComponent.priorSteps);
          }
        }
      }

      // the prior steps should be the ulterior step of the current step
      if (priorSteps?.length > 0) {
        // the step is locked until the prior steps are "DONE"
        // so it will passes as "TODO"
        productionStepExecution.status = "LOCKED";
        productionStepExecution.priorSteps = priorSteps;
        // the current step prior steps should have a ulterior step with the current prior steps
        for (const priorStep of priorSteps) {
          priorStepsMap.set(priorStep.index, productionStep);
        }
      } else {
        // if no steps before it, can "DO" it without waiting any prior steps
        productionStepExecution.status = "TODO";
      }

      /* ---------------- */
      /* ---- weight ---- */
      /* ---------------- */
      if (type === "fromRecipe" && productionStepObj.reusable) {
        const netWeight =
          productionStepObj.coeff !== null
            ? productionStepObj.coeff
            : productionStepObj.netWeight;

        productionStepExecution.netWeight = netWeight || 0;
        productionStepExecution.grossWeight =
          productionStepObj.grossWeight || 0;
      } else {
        productionStepExecution.netWeight = productionStep.netWeight || 0;
        productionStepExecution.grossWeight = productionStep.grossWeight || 0;
      }

      productionStepExecutions.push(productionStepExecution);
    }
  }

  return {
    productionStepExecutions,
    priorStepsMap
  };
};

export const setProductionStepExecutions = (
  productionItems
) => {
  let newSections = [];
  const expectedProductions = productionItems.reduce(
    (acc, curr) => acc + curr.expectedProduction,
    0
  );

  if (productionItems.length > 0) {
    // since all productionItems has the same recipe
    const recipe = productionItems[0].recipe;
    for (const section of recipe.sections) {
      const productionStepExecutionsToSave = getProductionStepExecutionsToSave(
        section.productionSteps
      );

      const sectionProductionStepExecutions = productionStepExecutionsToSave.productionStepExecutions.map(
        (productionStepExecution) => {
          const newProductionStepExecution = {
            ...productionStepExecution,
            recipe, // current recipe
            productionItems,
            section,
            theoreticalNetWeight:
              expectedProductions * (productionStepExecution.netWeight || 0),
            theoreticalGrossWeight:
              expectedProductions * (productionStepExecution.grossWeight || 0)
          };

          // the step netWeight and grossWeight are not saved
          delete newProductionStepExecution.netWeight;
          delete newProductionStepExecution.grossWeight;

          const ulteriorStep = productionStepExecutionsToSave.priorStepsMap.get(
            productionStepExecution.productionStep.index
          );

          if (ulteriorStep) {
            newProductionStepExecution.ulteriorStep = ulteriorStep;
          }

          return newProductionStepExecution;
        }
      );

      newSections.push(...sectionProductionStepExecutions);
    }
  }

  return newSections;
};

export const createProductionStepExecutions = (productionItems = []) => {
  const recipeMap = new Map();
  let productionStepExecutions = [];

  for (const productionItem of productionItems) {
    const prevRecipes = recipeMap.get(productionItem.recipe.id) || [];
    recipeMap.set(productionItem.recipe.id, [...prevRecipes, productionItem]);
  }

  for (const recipeProductionItems of Object.values(Object.fromEntries(recipeMap))) {
    productionStepExecutions = [
      ...productionStepExecutions,
      ...setProductionStepExecutions(recipeProductionItems)
    ];
  }

  return productionStepExecutions;
};
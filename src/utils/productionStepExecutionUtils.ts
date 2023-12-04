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

      // add the current map with the previous map
      priorStepsMap = mergedMaps(priorStepsMap, subPriorStepsMap);
    } else {
      const productionStepExecution: any = {
        productionStep // pointer
      };
      const priorSteps = []; // pointers

      if (productionStep.stepComponents) {
        for (const stepComponent of productionStep.stepComponents) {
          if (stepComponent.priorSteps) {
            // const productionStep = stepComponent.priorSteps;

            // // const priorProductionStepExecution = new ProductionStepExecution()
            // const priorProductionStepExecution: any = productionStep;

            // .save()
            // const newPriorProductionStepExecution = priorProductionStepExecution;
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

      /* --------------------------------------- */
      /* ---- step from section (as parent) ---- */
      /* --------------------------------------- */
      if (type === "fromRecipe") {
        if (productionStepObj.reusable) {
          productionStepExecution.netWeight =
            productionStepObj.coeff !== null
              ? productionStepObj.coeff
              : productionStepObj.netWeight;
        } else {
          productionStepExecution.netWeight = productionStepObj.netWeight;
        }

        productionStepExecution.grossWeight = productionStepObj.grossWeight;

        /* --------------------------------------- */
        /* - step from reusable step (as parent) - */
        /* --------------------------------------- */
      } else {
        productionStepExecution.netWeight = productionStep.netWeight;
        productionStepExecution.grossWeight = productionStep.grossWeight;
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


export const formatProductionStepExecutionsByProductionItem = (
  productionItem,
  productionItemsByRecipe,
  expectedProductions
) => {
  let bySections = [];

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

    bySections.push(...sectionProductionStepExecutions);
  }

  return bySections
};

export const formatProductionStepExecutionsByProductionItems = () => {
  let productionStepExecutions = [];

  for (const productionItem of productionItems) {
    const {
      productionItemsByRecipe,
      expectedProductions
    } = getProductionItemsByRecipe(productionItems, productionItem);

    const sectionProductionStepExecutions = formatProductionStepExecutionsByProductionItem(productionItem, productionItemsByRecipe, expectedProductions)
 
    productionStepExecutions = [
      ...productionStepExecutions,
      ...sectionProductionStepExecutions
    ];
  }

  return productionStepExecutions;
};

export const formatProductionStepExecutionsByProductionItem2 = () => {
  let productionStepExecutions = [];
  const productionItemsByRecipeMap = new Map();

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

// export const formatProductionStepExecutionsByProductionItem = () => {
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

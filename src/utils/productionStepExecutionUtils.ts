import { productionItems } from "../data/productionItem";

const getProductionStepExecutions = (
  productionSteps = [],
  parentIndex = null
): any => {
  const productionStepExecutions = [];
  const priorStepMap = new Map();

  for (const [index, productionStepObj] of (productionSteps as any).entries()) {
    const productionStep = (productionStepObj as any).step ?? productionStepObj;
    // console.log("productionStep",
    // productionStep.name, "-",
    // productionStep);

    if (productionStep.productionSteps) {
      // console.log("productionStep", index, ": ", productionStep.name, "-", productionStep);

      const {
        productionStepExecutions: subProductionStepExecutions
      } = getProductionStepExecutions(productionStep.productionSteps, index);
      productionStepExecutions.push(...subProductionStepExecutions);
    } else {
      // console.log("productionStep 2", index, ": ", productionStep.name, "-", productionStep);

      const productionStepExecution: any = {
        order: parentIndex ? parentIndex + index : index,
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
            // newPriorProductionStepExecution.priorSteps = priorSteps
            // productionStepExecutions.push(newPriorProductionStepExecution);
          }
        }
      }

      productionStepExecution.priorSteps = priorSteps;

      if (priorSteps) {
        for (const priorStep of priorSteps) {
          priorStepMap.set(priorStep.index, productionStep);
        }
      }

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

  // return productionStepExecutions;
  return {
    productionStepExecutions,
    priorStepMap
  };
};

// export const createProductionStepExecution2 = () => {
//   let productionStepExecutions = [];

//   for (const productionItem of productionItems) {
//     for (const section of productionItem.recipe.sections) {
//       productionStepExecutions = getProductionStepExecutions(
//         (section as any).productionSteps
//       );
//     }
//   }

//   return productionStepExecutions;
// };

export const createProductionStepExecution3 = () => {
  let productionStepExecutions = [];

  for (const productionItem of productionItems) {
    const recipeProductionStepExecutions = [];
    for (const section of productionItem.recipe.sections) {
      const productionStepExecutions = getProductionStepExecutions(
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
  productionStepExecutions,
  priorStepMap
) => {
  const priorMap = new Map();
  const newProductionStepExecutions = productionStepExecutions.map(
    (productionStepExecution, index) => {
      const newProductionStepExecution = {
        ...productionStepExecution
        // productionItem, // current productionItem
        // productionItems, // all production items with the same production date and recipe
        // section,
        // status: productionStepExecution.order === 0 ? "TODO" : "LOCKED"
      };

      if (productionStepExecution.priorSteps) {
        for (const priorStep of productionStepExecution.priorSteps) {
          // console.log('priorStep', priorStep)
          priorMap.set(priorStep.index, productionStepExecution);
        }
      }
      // console.log('priorStepMap', priorStepMap)

      // console.log('priorMap', priorMap, "-", productionStepExecution.productionStep.index)
      const current = priorStepMap.get(
        productionStepExecution.productionStep.index
      );
      // console.log('current', current)
      if (current) {
        newProductionStepExecution.ulteriorStep = current;
      }
      // const nexstep = productionStepExecutions[index + 1];

      // if (nexstep) {
      //   const nextStepPriorStep = nexstep.priorSteps.find((step) => {
      //     if (step.objectId) {
      //       return (
      //         step.objectId === productionStepExecution.productionStep.objectId
      //       );
      //     }

      //     return step.index === productionStepExecution.productionStep.index;
      //   });
      //   if (nextStepPriorStep) {
      //     newProductionStepExecution.ulteriorStep = nexstep;
      //   }
      // }

      // if (ulteriorStep) {
      //   // pointer
      //   newProductionStepExecution.ulteriorStep = ulteriorStep.productionStep;
      // }

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
      // priorStepMap
      productionStepExecutions = getRecipeProductionStepExecutions(
        productionItems,
        productionItem,
        section,
        recipeProductionStepExecutions.productionStepExecutions,
        recipeProductionStepExecutions.priorStepMap
        // priorStepMap
      );
    }
  }

  return productionStepExecutions;
};

export const getProductionStepPointerObj = (step, isObject) => {
  if (isObject) {
    return step.step;
  }

  return step;
};

export function updatePriorStepValuesForEachChild(
  stepComponent,
  sumIngredients
) {
  if (stepComponent.priorSteps?.stepComponents) {
    stepComponent.priorSteps.stepComponents.forEach((priorStepComponent) => {
      if (priorStepComponent.supplierItem) {
        sumIngredients.grossWeight += priorStepComponent.grossWeight;
        sumIngredients.netWeight += priorStepComponent.netWeight;
      }

      if (priorStepComponent.priorSteps) {
        updatePriorStepValuesForEachChild(priorStepComponent, sumIngredients);
      }
    });
  }

  return sumIngredients;
}

const updateStepWeightAndCost = (step, values) => {
  step.netWeight = values.stepNetWeight;
  step.grossWeight = values.stepGrossWeight;
  step.totalNetWeight = values.stepTotalNetWeight;
  step.totalGrossWeight = values.stepTotalGrossWeight;
  step.cost = values.stepCost;
  step.realCost = values.stepRealCost;
  step.totalInputWeight = values.stepTotalGrossWeight;
  step.totalOutputWeight = values.stepTotalNetWeight;
};

export const computeStepData = (
  step,
  ingredientsField = "stepComponents",
  fromRecipe = false
) => {
  const stepPointerObj = getProductionStepPointerObj(step, fromRecipe);

  const {
    stepCost,
    stepRealCost,
    stepNetWeight,
    stepGrossWeight,
    stepTotalGrossWeight,
    stepTotalNetWeight
  } = stepPointerObj[ingredientsField].reduce(
    (acc, ingredient) => {
      let grossWeight = ingredient.grossWeight || 0;
      let netWeight =
        (ingredient.netWeight && parseFloat(ingredient.netWeight)) || 0;
      let totalGrossWeight = grossWeight || 0;
      let totalNetWeight = netWeight || 0;

      if (ingredient.priorSteps && !ingredient.supplierItem) {
        let sumIngredients = { grossWeight: 0, netWeight: 0 };
        /** for a stepComponent with priorSteps we need to calculate grossWeight, netWeight for all subComponents
         * those values are reported on totalGrossWeight and totalNetWeight **/
        grossWeight = 0;
        netWeight = 0;
        sumIngredients = updatePriorStepValuesForEachChild(
          ingredient,
          sumIngredients
        );
        ingredient.grossWeight = sumIngredients.grossWeight;
        ingredient.netWeight = sumIngredients.netWeight;
        totalGrossWeight = sumIngredients.grossWeight;
        totalNetWeight = sumIngredients.netWeight;
      }

      acc.stepCost += ingredient.cost || 0;
      acc.stepRealCost += ingredient.realCost || 0;
      acc.stepNetWeight +=
        ingredient.priorSteps && !ingredient.supplierItem
          ? totalNetWeight
          : netWeight;
      acc.stepGrossWeight +=
        ingredient.priorSteps && !ingredient.supplierItem
          ? totalGrossWeight
          : grossWeight;
      acc.stepTotalGrossWeight += totalGrossWeight;
      acc.stepTotalNetWeight += totalNetWeight;

      return acc;
    },
    {
      stepCost: 0,
      stepRealCost: 0,
      stepNetWeight: 0,
      stepGrossWeight: 0,
      stepTotalGrossWeight: 0,
      stepTotalNetWeight: 0
    }
  );

  const values = {
    stepNetWeight,
    stepGrossWeight,
    stepTotalNetWeight,
    stepTotalGrossWeight,
    stepCost,
    stepRealCost
  };

  updateStepWeightAndCost(step, values);

  // update step.step
  if (fromRecipe) {
    updateStepWeightAndCost(stepPointerObj, values);
  }
};

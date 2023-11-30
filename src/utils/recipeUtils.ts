import { cloneDeep } from "lodash";

export const parseReusableProductionStepToObject = (step) => {
  const {
    reusableStepTotalGrossWeight,
    netWeight,
    cost,
    realCost
  } = formatValuesWithWeight(step);

  return {
    grossWeight: reusableStepTotalGrossWeight,
    netWeight,
    cost,
    realCost
  };
};

export const recalculateCostValues = (stepComponent) => {
  stepComponent.grossWeight =
    stepComponent.netWeight /
    ((stepComponent.transformRate ? stepComponent.transformRate : 100) / 100);

  if (stepComponent.supplierItem) {
    stepComponent.realCost =
      stepComponent.grossWeight * stepComponent.supplierItem.pricePerKg;
  }

  return stepComponent;
};

export const recalculateCostValuesPriorStep = (stepComponent) => {
  stepComponent.netWeight =
    stepComponent.grossWeight *
    ((stepComponent.transformRate ? stepComponent.transformRate : 100) / 100);
  stepComponent.realCost =
    stepComponent.grossWeight * stepComponent.supplierItem.pricePerKg;

  return stepComponent;
};

export const recalculateStepComponentsCost = (step) => {
  const stepComponents = step.stepComponents.map((stepComponent) =>
    recalculateCostValues(stepComponent)
  );
  const newStep = { ...step, stepComponents };
  return newStep;
};

export const getRessourceFoodCost = (
  grossWeightInKilo = 0,
  pricePerKilo = 0
) => {
  return grossWeightInKilo * pricePerKilo;
};

export const formatValuesWithWeight = (stepObj) => {
  const step = cloneDeep(stepObj);
  // console.log('stepComponent.netWeight', step)

  let stepGrossWeight = 0;
  let stepNetWeight = 0;
  let stepCost = 0;

  // Iterate over the stepComponents array in each production step
  step.stepComponents?.forEach((stepComponent, index) => {
    console.log("-", stepComponent);

    // Add the grossWeight and netWeight of each stepComponent to the step totals
    if (!stepComponent.priorSteps) {
      stepComponent.realCost = getRessourceFoodCost(
        stepComponent.grossWeight || 0,
        stepComponent.supplierItem?.pricePerKg || 0
      );
      stepCost += stepComponent.realCost;

      stepNetWeight += stepComponent.netWeight || 0;
      stepGrossWeight += stepComponent.grossWeight || 0;
    } else {
      stepComponent.priorSteps = formatValuesWithWeight(
        stepComponent.priorSteps
      );
    }
  });

  // Assign the step totals back to the production step
  step.grossWeight = stepGrossWeight;
  step.netWeight = stepNetWeight;
  step.cost = stepCost;
  step.realCost = stepCost; // TODO: To be removed after data sanitization
  return step;
};

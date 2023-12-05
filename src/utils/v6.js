export const setProductionStepExecutions = (productionItems) => {
  let newSections = [];
  const expectedProductions = productionItems.reduce(
    (acc, curr) => acc + curr.expectedProduction,
    0
  );

  if (productionItems.length > 0) {
    // since all productionItems has the same recipe
    const recipe = productionItems[0].recipe;
    console.log(recipe);
    for (const section of recipe.sections) {
      const productionStepExecutionsToSave = getProductionStepExecutionsToSave(
        section.productionSteps
      );

      const sectionProductionStepExecutions = productionStepExecutionsToSave.productionStepExecutions.map(
        (productionStepExecution) => {
          const newProductionStepExecution = {
            ...productionStepExecution,
            productionStep: productionStepExecution.productionStep.name, // current recipe
            recipe: recipe.id, // current recipe
            productionItems: productionItems.map(
              (productionItem) => productionItem.name
            ),
            priorSteps: productionStepExecution.priorSteps?.map(
              (priorStep) => priorStep.name
            ),
            section: section.name,
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
            newProductionStepExecution.ulteriorStep = ulteriorStep.name;
          }

          return newProductionStepExecution;
        }
      );

      newSections.push(...sectionProductionStepExecutions);
    }
  }

  return newSections;
};

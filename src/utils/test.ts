// export const createProductionStepExecution = () => {
//   for (const productionItem of productionItems) {
//     for (const section of productionItem.recipe.sections) {
//       for (const productionStepObj of section.productionSteps) {
//         const productionStep = productionStepObj.step
//         const productionStepExecution = new ProductionStepExecution()
//         productionStepExecution.set("productionStep", { productionStep })
//         productionStepExecution.set("productionItems", productionItems)
//         const priorSteps = []

//         for (const stepComponent of productionStep.stepComponents) {
//           const productionStep = stepComponent.priorSteps
//           const priorProductionStepExecution = new ProductionStepExecution()
//           priorProductionStepExecution.set("productionStep", { productionStep })
//           const newPriorProductionStepExecution = await priorProductionStepExecution.save()
//           priorSteps.push(newPriorProductionStepExecution)
//         }

//         productionStepExecution.set("priorSteps", priorSteps)

//         if (priorSteps.length > 0) {
//           productionStepExecution.set("status", "LOCKED")
//         } else {
//           productionStepExecution.set("status", "TODO")
//         }
//         await productionStepExecution.save()
//       }
//     }
//   }
// }

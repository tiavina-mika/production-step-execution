import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { createProductionStepExecution } from "./utils/productionStepExecutionUtils";

const productionStepExecution = createProductionStepExecution();
// console.log("productionStepExecution", productionStepExecution);

// v2
// const formattedItems = productionStepExecution.map((item) => {
//   return item.map((step) => {
//     return step.map((subStep: any) => ({
//       name: subStep.productionStep.name,
//       ...subStep
//     }));
//   });
// });
// console.log("formattedItems", formattedItems);

// v1
const formattedItems = productionStepExecution.map((item) => {
  return {
    name: item.productionStep.name,
    ...item
  };
});
console.log("formattedItems", formattedItems);

const App = () => {
  return (
    <Stack spacing={2} direction="row">
      <Button variant="text">Text</Button>
      <Button variant="contained">Contained</Button>
      <Button variant="outlined">Outlined</Button>
    </Stack>
  );
};

export default App;

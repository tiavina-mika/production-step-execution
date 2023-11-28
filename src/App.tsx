import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { createProductionStepExecution } from "./utils/productionStepExecutionUtils";

const productionStepExecution = createProductionStepExecution();
// console.log("productionStepExecution", productionStepExecution);

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

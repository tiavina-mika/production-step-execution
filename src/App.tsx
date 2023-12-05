import * as React from "react";
import Stack from "@mui/material/Stack";
import { JsonView, allExpanded, darkStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

import { createProductionStepExecutions } from "./utils/productionStepExecutionUtils";
import { productionItems } from "./data/productionItem";

// @ts-ignore
const productionStepExecution = createProductionStepExecutions(productionItems);

const formattedItems = productionStepExecution.map((item) => {
  return {
    // name: item.productionStep.name,
    ...item
  };
});

console.log("------------------");
console.log("result", formattedItems);
console.log("------------------");

const App = () => {
  return (
    <Stack spacing={2} direction="row">
      <JsonView
        data={formattedItems}
        shouldExpandNode={allExpanded}
        style={darkStyles}
      />
    </Stack>
  );
};

export default App;

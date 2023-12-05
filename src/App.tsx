import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import {
  JsonView,
  allExpanded,
  darkStyles,
  defaultStyles
} from "react-json-view-lite";
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

console.log("formattedItems", formattedItems);

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

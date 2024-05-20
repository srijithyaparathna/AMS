import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import App from "./App";
import { registerLicense } from "@syncfusion/ej2-base";


// Registering Syncfusion license key
registerLicense(
  "ORg4AjUWIQA/Gnt2UFhhQlJBfVldWXxLflFyVWBTeld6d1xWACFaRnZdRl1mSXtScEVjWXlWeHVV"
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <Route path="/" component={App} />
  </Router>
);

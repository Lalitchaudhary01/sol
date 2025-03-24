import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import App from "./App";
import store from "./redux/store"; // Import the store

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Wrap the App component with the Provider and pass the store */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

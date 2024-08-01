import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import StarRating from "./StarRating";

function TestRating() {
  const [movieRating, setMovieRating] = useState(0);
  return (
    <div>
      <StarRating color="blue" onSetRating={setMovieRating} />
      <p>This movie got {movieRating} rating</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating maxRating={7} color={"#000"} />
    <StarRating maxRating={10} defaultRating={5} />
    <StarRating
      maxRating={5}
      messages={["bad", "Ok", "Good", "Excellent"]}
      defaultRating={3}
    />
    <TestRating /> */}
  </React.StrictMode>
);

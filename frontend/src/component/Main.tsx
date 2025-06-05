import React, { useState } from "react";
import Signup from "./Signup";
import Signin from "./Signin";

const Main: React.FC = () => {
  const [view, setView] = useState<"signin" | "signup">("signin");

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1>MongoDB Backup Utility</h1>
      <div style={{ margin: "1rem 0" }}>
        <button onClick={() => setView("signin")} disabled={view === "signin"}>
          Sign In
        </button>
        <button onClick={() => setView("signup")} disabled={view === "signup"} style={{ marginLeft: "1rem" }}>
          Sign Up
        </button>
      </div>

      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
        {view === "signin" ? <Signin /> : <Signup />}
      </div>
    </div>
  );
};

export default Main;

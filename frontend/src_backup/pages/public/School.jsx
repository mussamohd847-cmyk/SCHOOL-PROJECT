import React from "react";
import { Link } from "react-router-dom";

export default function School() {
  return (
    <main>
      <h1>NIA School</h1>

      <p>
        Our school programme provides a supportive
        environment for academic and personal growth.
      </p>

      <Link to="/">
        Back Home
      </Link>
    </main>
  );
}
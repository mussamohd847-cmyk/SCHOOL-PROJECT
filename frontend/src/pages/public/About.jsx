import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <main>
      <h1>About NIA Schools</h1>
      <p>
        Welcome to NIA Schools. We are committed to
        quality education, character development and
        lifelong learning.
      </p>

      <Link to="/">
        Back Home
      </Link>
    </main>
  );
}
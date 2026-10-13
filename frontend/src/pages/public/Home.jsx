import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const academicLevels = [
  "JUVENILE",
  "KG 1",
  "KG 2",
  "GRADE 1",
  "GRADE 2",
  "GRADE 3",
  "GRADE 4",
  "GRADE 5",
  "GRADE 6",
  "GRADE 7",
];

const schoolValues = [
  {
    number: "01",
    title: "Quality Education",
    text: "We provide quality education that helps every learner build strong academic knowledge and practical skills.",
  },
  {
    number: "02",
    title: "Islamic Values",
    text: "We promote good character, discipline, respect and Islamic values as part of the learner's development.",
  },
  {
    number: "03",
    title: "Child Development",
    text: "We support the academic, social, emotional and personal development of every child.",
  },
  {
    number: "04",
    title: "Safe Environment",
    text: "We provide a caring, respectful and supportive environment where learners can learn and grow confidently.",
  },
];

const activityPhotos = Object.entries(
  import.meta.glob("../photo/*.{jpeg,jpg,png,webp}", {
    eager: true,
    query: "?url",
    import: "default",
  })
)
  .map(([path, src]) => ({ path, src }))
  .sort((a, b) =>
    a.path.localeCompare(b.path, undefined, { numeric: true, sensitivity: "base" })
  );

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function Home() {
  return (
    <main className="nia-home">

      <section className="nia-hero">
        <div className="nia-hero-overlay" />

        <div className="nia-container nia-hero-content">

          <div className="nia-hero-copy">

            {/* =================================================
                TOP BAR
                LOGO + SCHOOL NAME + REGISTER + LOGIN
            ================================================== */}

            <div className="nia-topbar">

              {/* SCHOOL BRAND */}

              <div className="nia-brand">

                <div className="nia-logo-wrapper">
                  <img
                    src="/NIA SCHOOLS.jpg"
                    alt="Nimble Integrated Academy logo"
                    className="nia-logo"
                  />
                </div>

                <div className="nia-brand-name">
                  <strong>
                    NIMBLE INTEGRATED ACADEMY
                  </strong>

                  <span>
                    (NIA)
                  </span>
                </div>

              </div>

              {/* REGISTER + LOGIN */}

              <div className="nia-auth-actions">

                <Link to="/register" className="nia-btn nia-btn-primary">
  Register
</Link>
                <Link
                  to="/login"
                  className="nia-btn nia-btn-light"
                >
                  Login
                </Link>

              </div>

            </div>

            {/* =================================================
                HERO EYEBROW
            ================================================== */}

            <span className="nia-eyebrow">
              SCHOOL & MADRASA
            </span>

            {/* =================================================
                HERO TITLE
            ================================================== */}

            <h1>
              Actions are by
              <br />
              <span>
                Intentions
              </span>

            </h1>

            {/* =================================================
                HERO DESCRIPTION
            ================================================== */}

            <p>
              Welcome to Nimble Integrated Academy, where we provide
              quality education and Islamic values in a caring,
              disciplined and supportive learning environment.
            </p>

            {/* =================================================
                HERO ACTIONS
            ================================================== */}

            <div className="nia-hero-actions">

              <Link
                to="/about"
                className="nia-btn nia-btn-primary"
              >
                About NIA
                <ArrowIcon />
              </Link>

              <Link
                to="/contact"
                className="nia-btn nia-btn-light"
              >
                Contact School
                <ArrowIcon />
              </Link>

            </div>

          </div>

          {/* ===================================================
              HERO SIDE MESSAGE
          ==================================================== */}

          <div className="nia-hero-badge">

            <span className="nia-badge-line" />

            <div>
              <strong>
                Learn.
              </strong>

              <strong>
                Grow.
              </strong>

              <strong>
                Achieve.
              </strong>
            </div>

          </div>

        </div>

        {/* =====================================================
            HERO BOTTOM FEATURES
        ====================================================== */}

        <div className="nia-hero-bottom">

          <div>
            <span>
              01
            </span>

            <p>
              Quality Education
            </p>
          </div>

          <div>
            <span>
              02
            </span>

            <p>
              Islamic Values
            </p>
          </div>

          <div>
            <span>
              03
            </span>

            <p>
              Child Development
            </p>
          </div>

        </div>

      </section>

      {/* =====================================================
          NIA ACTIVITIES GALLERY
      ====================================================== */}

      <section className="nia-section nia-activities">
        <div className="nia-container">
          <div className="nia-activities-heading">
            <span className="nia-small-label">LIFE AT NIA</span>
            <h2>Our School Activities</h2>
            <p>Discover learning, creativity and memorable moments at NIA School & Madrasa.</p>
          </div>

          <div className="nia-activities-grid">
            {activityPhotos.map((photo, index) => (
              <figure className="nia-activity-item" key={photo.path}>
                <img
                  src={photo.src}
                  alt={`NIA school activity ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  <span>ACTIVITY {(index + 1).toString().padStart(2, "0")}</span>
                  <strong>NIA School & Madrasa</strong>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY NIA
      ====================================================== */}

      <section className="nia-section nia-values">

        <div className="nia-container">

          <div className="nia-heading-centered">

            <span className="nia-small-label">
              WHY NIA
            </span>

            <h2>
              More than
              <span>
                {" "}classroom learning.
              </span>
            </h2>

            <p>
              We focus on developing knowledgeable, disciplined,
              confident and responsible learners.
            </p>

          </div>

          <div className="nia-values-grid">

            {schoolValues.map((value) => (

              <article
                className="nia-value-card"
                key={value.number}
              >

                <span className="nia-value-number">
                  {value.number}
                </span>

                <div className="nia-value-icon">
                  <span />
                </div>

                <h3>
                  {value.title}
                </h3>

                <p>
                  {value.text}
                </p>

              </article>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          ACADEMIC LEVELS
      ====================================================== */}

      <section className="nia-section nia-academics">

        <div className="nia-container">

          <div className="nia-academics-grid">

            <div>

              <span className="nia-small-label">
                ACADEMIC LEVELS
              </span>

              <h2>
                A learning journey
                <br />
                <span>
                  for every stage.
                </span>
              </h2>

              <p>
                NIA provides education from the early years through
                primary school, giving learners a progressive
                educational journey as they grow.
              </p>

              <Link
                to="/academics"
                className="nia-btn nia-btn-primary"
              >
                View Academics
                <ArrowIcon />
              </Link>

            </div>

            <div className="nia-levels">

              {academicLevels.map((level, index) => (

                <div
                  className="nia-level"
                  key={level}
                >

                  <span>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <strong>
                    {level}
                  </strong>

                  <ArrowIcon />

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          SCHOOL EXPERIENCE
      ====================================================== */}

      <section className="nia-feature">

        <div className="nia-feature-overlay" />

        <div className="nia-container nia-feature-content">

          <span className="nia-small-label">
            THE NIA DIFFERENCE
          </span>

          <h2>
            Learning with
            <br />
            <span>
              purpose and values.
            </span>
          </h2>

          <p>
            At NIA, education is built around academic achievement,
            good character, discipline, respect and preparation for
            the future.
          </p>

          <Link
            to="/about"
            className="nia-btn nia-btn-light"
          >
            Discover NIA
            <ArrowIcon />
          </Link>

        </div>

      </section>

      {/* =====================================================
          ADMISSION CTA
      ====================================================== */}

      <section className="nia-cta">

        <div className="nia-container nia-cta-content">

          <div>

            <span className="nia-small-label">
              ADMISSIONS
            </span>

            <h2>
              Give your child
              <br />
              <span>
                a strong educational foundation.
              </span>
            </h2>

          </div>

          <div className="nia-cta-actions">

            <Link
              to="/contact"
              className="nia-btn nia-btn-dark"
            >
              Contact NIA
              <ArrowIcon />
            </Link>

            <Link
              to="/academics"
              className="nia-btn nia-btn-outline"
            >
              View Academics
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="nia-footer">

        <div className="nia-container nia-footer-grid">

          {/* =================================================
              BRAND
          ================================================== */}

          <div className="nia-footer-brand">

            <div className="nia-footer-logo-wrapper">

              <img
                src="/NIA SCHOOLS.jpg"
                alt="Nimble Integrated Academy"
                className="nia-footer-logo-image"
              />

            </div>

            <h3>
              NIMBLE INTEGRATED ACADEMY
            </h3>

            <span className="nia-footer-short">
              (NIA)
            </span>

            <p>
              Quality education, Islamic values and strong character
              for a better future.
            </p>

          </div>

          {/* =================================================
              EXPLORE
          ================================================== */}

          <div>

            <h4>
              Explore
            </h4>

            <Link to="/">
              Home
            </Link>

            <Link to="/about">
              About NIA
            </Link>

            <Link to="/academics">
              Academics
            </Link>

            <Link to="/school">
              School
            </Link>

            <Link to="/madrasa">
              Madrasa
            </Link>

          </div>

          {/* =================================================
              ACADEMICS
          ================================================== */}

          <div>

            <h4>
              Academics
            </h4>

            <Link to="/academics">
              Juvenile
            </Link>

            <Link to="/academics">
              KG 1
            </Link>

            <Link to="/academics">
              KG 2
            </Link>

            <Link to="/academics">
              Primary
            </Link>

          </div>

          {/* =================================================
              CONTACT
          ================================================== */}

          <div>

            <h4>
              Contact NIA
            </h4>

            <p>
              P.O.BOX 1213, ZANZIBAR.
            </p>

            <p>
              NIMBLE INTEGRATED ACADEMY (NIA)
            </p>

            <p>
              Phone: 0658702025 / 0619556080 / 0776601451
            </p>

            <p>
              Email: niasch2025@gmail.com
            </p>

          </div>

        </div>

        {/* ===================================================
            FOOTER BOTTOM
        ==================================================== */}

        <div className="nia-footer-bottom">

          <div className="nia-container">

            <p>
              © 2026 NIMBLE INTEGRATED ACADEMY (NIA).
              All Rights Reserved.
            </p>

            <p>

            </p>

          </div>

        </div>

      </footer>

    </main>
  );
}

export default Home;

/* =====================================================================
   Teacher Connect — settings
   This is the ONLY file you normally need to edit.
   After editing, upload it to Plesk again and bump APP_VERSION in sw.js
   so phones pick up the change.
   ===================================================================== */

window.TC_CONFIG = {

  /* Google sign-in.
     Paste the OAuth "Client ID" from Google Cloud Console here
     (looks like 1234567890-abc123.apps.googleusercontent.com).
     While this is empty the app runs in SETUP MODE: it shows a
     "Continue (setup mode)" button instead of Google sign-in. */
  googleClientId: "497095698879-fk6hd0t3hh26kr78pu3ikbpvi8b411j6.apps.googleusercontent.com",

  /* Only accounts from this domain can get past the sign-in screen. */
  schoolDomain: "gdhaec.edu.mv",

  /* Days before a teacher must sign in again on the same phone. */
  sessionDays: 30,

  /* The portal website (opened from the Website tab and the last tile). */
  portalUrl: "https://teacherconnect.gdhaec.edu.mv",

  /* Help shown on the Profile screen. */
  supportText: "ICT unit",

  /* Big card at the top of the home screen. Points at a module + link id below. */
  featured: { module: "attendance", link: "register",
              title: "Daily register", subtitle: "Mark today's class register at Period 0", button: "Mark" },

  /* Quick-action chips under the tiles: "moduleId/linkId". */
  quickActions: ["attendance/register", "me/observations", "shine/myshine", "shine/badges"],

  /* ---------------------------------------------------------------
     MODULES
     url   = the module's web app address ( …/exec ).
     links = shortcuts shown in the module's sheet. Give a link its own
             url ONLY if the module can open that screen directly
             (for example …/exec?page=register). Links without a url
             open the module's main page.
     deepLink = "page" makes quick links open …/exec?page=<link id>,
             so the module can jump straight to that screen.
     soon  = true shows "Coming soon" and blocks opening.
     colour: sky | red | green | navy | amber
     icon:   calendar | heart | eye | file | sparkle
     --------------------------------------------------------------- */
  modules: [
    {
      id: "attendance", deepLink: "page", name: "Student Attendance", colour: "sky", icon: "calendar",
      audience: "All teachers",
      description: "Mark the daily register at Period 0, record lesson attendance, cover lessons as a substitute and follow up on absences.",
      url: "https://script.google.com/a/macros/gdhaec.edu.mv/s/AKfycbwS9ZCasHZtBtp05vvtvZNsu7cNS9r2rJCH25QXwIaYdw7F1tGARC5RUFB5OKbhYB0i/exec",
      links: [
        { id: "register",      label: "Daily register" },
        { id: "lessons",       label: "Lesson marking" },
        { id: "substitutions", label: "Substitutions" },
        { id: "insights",      label: "Insights" }
      ]
    },
    {
      id: "care", name: "Student CARE", colour: "red", icon: "heart", soon: true,
      audience: "Teachers · SMT · Counsellor",
      description: "Raise a concern about a student in under a minute. SMT decide what each concern needs, then open a case with actions, regular reviews and a recorded outcome.",
      url: "",
      links: [
        { id: "raise",   label: "Raise a concern" },
        { id: "inbox",   label: "CARE inbox" },
        { id: "actions", label: "My actions" },
        { id: "cases",   label: "Cases" }
      ]
    },
    {
      id: "me", deepLink: "page", name: "Monitoring and Evaluation", short: "Monitoring & Evaluation", colour: "green", icon: "eye",
      audience: "Teachers · HoDs · LTs · Principal",
      description: "Lesson observations, notebook reviews, weekly reports, student voice, end-of-term reflection and term reports. Each person sees the screens for their role.",
      note: "links depend on your role",
      url: "https://script.google.com/a/macros/gdhaec.edu.mv/s/AKfycbwRbb5sbHhSoGlRcsx6mjFHqdfDMqxjg4-78XIR49vXqsjWHXCSx9LPEV3LLM2UZxk/exec",
      links: [
        { id: "observations", label: "Observations & reviews" },
        { id: "log",          label: "Log" },
        { id: "reflection",   label: "Reflection" },
        { id: "voice",        label: "Student voice" },
        { id: "reports",      label: "Reports" },
        { id: "dashboard",    label: "Dashboard" }
      ]
    },
    {
      id: "exam", name: "Exam", colour: "navy", icon: "file", soon: true,
      audience: "Teachers · HoDs",
      description: "Exam papers, marks and results analysis in one place.",
      url: "",
      links: []
    },
    {
      id: "shine", deepLink: "page", name: "Shine", colour: "amber", icon: "sparkle",
      audience: "All staff",
      description: "Earn Sparks for every All-In Week (no missed day) and Clockwork Week (on time every day). Collect badges for months, terms and streaks. No rankings: you compete with yourself.",
      url: "https://script.google.com/a/macros/gdhaec.edu.mv/s/AKfycbxGkfOGTnxoCMZD7kJt1U3DZBt7y7KqRjwyNKi2D48hjzGrQQnm4CZS-09-wYuJd6yz/exec",
      links: [
        { id: "myshine",     label: "My Shine" },
        { id: "badges",      label: "Badges" },
        { id: "journey",     label: "My Journey" },
        { id: "recognition", label: "Recognition wall" }
      ]
    }
  ]
};

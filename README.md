# <img src="./frontend/public/favicon.svg" alt="Agility logo" height="50" width="50"/> Agility

**Agility** is a full-stack application that implements an agile framework for managing projects in an easy-to-use interface. Agility’s goal is to simplify the process of assigning, coordinating, and managing tasks across a project team, thereby reducing overhead for managers and project leaders. Its simplified, non-esoteric workflow helps newcomers to agile management benefit from a structured approach to product development without the complexity of traditional project-management tools. Agility was built with TypeScript, React, Vite, Node.js, Express, Bootstrap 5 / React-Bootstrap, Passport, and MongoDB.

### Use these credentials with our deployment to get an idea of what the project looks and functions like:

> **username:** manager
>
> **password:** bb361234

For our live demo, the database hosts sample project phases and tickets with mock data for certain fields. The seed tickets collection is composed of mock apparel/product-development style tasks.

> _Login page of Agility._
> ![Login Page Screenshot](./res/login.png)
> _Tasks (Kanban) page of Agility._
> ![Tasks Page Screenshot](./res/tasks.png)
> _Plan Phases page of Agility._
> ![Plan Phases Page Screenshot](./res/phases.png)
> _Manage Team page of Agility._
> ![Manage Team Page Screenshot](./res/manageteam.png)
> _Update Profile modal of Agility._
> ![Update Profile Screenshot](./res/updateprofile.png)

## Live Demo and Documentation

- **[Deployed Site Link](https://agility-9mgz.onrender.com)**
- **[Live Demo Video Walkthrough](https://www.youtube.com/watch?v=d67X1zP1YWc)**
- **[Project slides](https://docs.google.com/presentation/d/1HH5gNB5C2IYwxkiWIO7IowZV0NaZspN5yNxM82lwfjc/edit?usp=sharing)**
- **[Design Document](https://docs.google.com/document/d/159umoDcDq4ZdloeNzaaqiC0UZGvfEbOEEepKRk__HHQ/edit?usp=sharing)**

## Authors

- Aryan Yadav: Kanban/tasks and phases full-stack.
- Vasilios Nicholas: Authentication and team management full-stack.

## Project Objective

The goal of Agility is to make agile project management simpler and more approachable than typical tools. Managers can plan phases, assign developers to a team, create and assign tickets, and track progress on a Kanban board. Developers can create tickets for themselves and act on tickets assigned by their manager — all in one place.

This project was created as the third project for [CS5610 Web Development](https://johnguerra.co/classes/webDevelopment_online_summer_2026/) at Northeastern University, during the Summer 2026 semester.

From a technical standpoint, the project was built to practice full-stack web development using Node.js, Express, MongoDB, TypeScript, and a React single-page application. Specific objectives include:

- Building a React SPA with client-side routing, where the Express server serves the built frontend and protects routes by authentication and account type.
- Implementing a REST API with Express that supports CRUD operations across three MongoDB collections: `users`, `tickets`, and `phases`.
- Using session-based authentication with Passport Local and bcrypt-hashed passwords.
- Enforcing role-based access so managers can plan phases and manage teams, while developers work tickets on the active-phase Kanban board.
- Deploying the application to a public server so it is accessible to real users.
- Using TypeScript across the full stack to ensure type safety and reduce runtime errors.
- Using React-Bootstrap to create a responsive, mobile-first UI with a consistent design system.
- Using React Hook Form and Yup to create reusable form components with validation for authentication and profile management.
- Keyboard grid navigation controls for the Kanban board and Manage Team.

## App Instructions

Navigating to Agility presents a login/register gate. After creating an account as a **Developer** or **Manager** (or signing in), you are taken to the **Tasks** page.

On **Tasks**, you see a summary of ticket statuses, a cumulative completion chart for the active phase, and a Kanban board. Developers can create tickets for themselves in the active phase and move tickets assigned to them across **To-Do**, **In Progress**, and **Completed**. Managers can additionally use a **Backlog** column, create and assign tickets for their team, and delete tickets.

Managers can open **Plan Phases** to review planned and past phases, add new phases with start and end dates, delete phases, and manage which backlog tickets belong to a phase. Managers can also open **Manage Team** to see developers assigned to their team versus unassigned developers, assign or unassign developers, and email team members. Managers can also unassign developers from their team, which removes them from any assigned tickets and phases.

From the profile menu in the navbar, any signed-in user can **Update Profile** (email, username, full name, password) or delete their account.

### Keyboard Controls

#### General Keyboard Navigation and Interaction

> The app is designed to be fully navigable with a keyboard. You can use the **Tab** key to move between interactive elements, **Shift-Tab** to move between elements in reverse, **Enter** to activate buttons, links, or submit forms, and **Escape** to close modals.

#### Kanban Board Keyboard Grid Controls

> There are two sets of keyboard controls:
>
> > - Pressing **Tab** will allow you to iterate through the page, including the kanban columns. Pressing **Enter** on a column will allow you to start iterating through tickets (and the buttons of those tickets) of that column with **Tab** and **Shift-Tab**. To exit ticket navigation and return to column navigation, press **Escape**.
> > - You can also use the **Arrow keys** to navigate between tickets and columns: horizontal arrow keys to move between columns, and vertical arrow keys to move between tickets in a column. Use **Tab** to navigate through the actions of a ticket and **Enter** to execute an action.

#### Team Management Keyboard Grid Controls

> Team management Grid controls are the same as the Kanban board listed above. There are two sets of keyboard controls:

> > - Pressing **Tab** will allow you to iterate through the page, including the sections listing assigned and unassigned developers. Pressing **Enter** on a column will allow you to start iterating through developers in a section (and the buttons of those associated with actions on each developer) of that section with **Tab** and **Shift-Tab**. To exit developer navigation and return to section navigation, press **Escape**.
> > - You can also use the **Arrow keys** to navigate between developers and sections: horizontal arrow keys to move between sections, and vertical arrow keys to move between developers in a column. Use **Tab** to navigate through the actions of a developer and **Enter** to execute an action.

## Project Structure

```
Agility
├── data
│   ├── seed-phases.json                        # Mock phase documents are provided here for MongoDB seeding.
│   ├── seed-tickets.json                       # Mock ticket documents are provided here for MongoDB seeding.
│   └── seed-users.json                         # Mock user documents are provided here for MongoDB seeding.
├── .env.example                                # Example environment variables are provided here for local/hosted runs.
├── eslint.config.js                            # ESLint rules are defined here for the root project.
├── frontend                                    # The React + Vite SPA is contained here.
│   ├── eslint.config.js                        # ESLint rules are defined here for the frontend project.
│   ├── index.html                              # The SPA's HTML entry point is defined here.
│   ├── package.json                            # Frontend dependencies and scripts are declared here.
│   ├── package-lock.json
│   ├── public
│   │   └── favicon.svg                         # The site favicon is stored here.
│   ├── src
│   │   ├── components
│   │   │   ├── AgilityLogo.tsx                 # The app logo is rendered here.
│   │   │   ├── AppNavbar.tsx                   # The top navigation bar is rendered here.
│   │   │   ├── authentication                  # Login/register UI is contained here.
│   │   │   │   ├── AuthWindow.tsx              # A shared container for login/register forms is provided here.
│   │   │   │   ├── Login.tsx                   # The login form is implemented here.
│   │   │   │   └── Register.tsx                # The registration form is implemented here.
│   │   │   ├── FormComponents.d.ts             # Shared form-related types are declared here.
│   │   │   ├── FormWindow.tsx                  # A reusable form modal/window is defined here.
│   │   │   ├── kanban                          # Board, cards, drag-and-drop, timeline, and new-ticket UI are contained here.
│   │   │   │   ├── AssignTicket.tsx            # Ticket-assignment UI is implemented here.
│   │   │   │   ├── Drag.tsx                    # Drag-and-drop behavior is implemented here.
│   │   │   │   ├── dragTypes.d.ts              # Drag-and-drop types are declared here.
│   │   │   │   ├── KanbanCard.tsx              # An individual ticket card is rendered here.
│   │   │   │   ├── KanbanGridColumn.tsx        # A single board column is rendered here.
│   │   │   │   ├── KanbanList.tsx              # The full board layout is rendered here.
│   │   │   │   ├── NewTicketModal.tsx          # Ticket creation is handled here.
│   │   │   │   ├── PhaseTimeline.tsx           # A visual phase timeline is rendered here.
│   │   │   │   └── TaskProgressBar.tsx         # Ticket/phase progress is visualized here.
│   │   │   ├── management                     # Team-assignment UI is contained here.
│   │   │   │   └── ListDevs.tsx                # A list of developers is rendered here.
│   │   │   ├── phases                          # Phase-list and ticket-assignment modals are contained here.
│   │   │   │   ├── ManagePhaseTicketsModal.tsx # Tickets within a phase are managed here.
│   │   │   │   ├── NewPhaseModal.tsx           # Phase creation is handled here.
│   │   │   │   └── PhaseSection.tsx            # A single phase's section is rendered here.
│   │   │   ├── profile                         # Profile view/update/delete UI is contained here.
│   │   │   │   ├── Avatar.tsx                  # A user's avatar is rendered here.
│   │   │   │   ├── DeleteProfile.tsx           # Profile deletion is handled here.
│   │   │   │   ├── ManageProfileComponent.tsx  # Profile-management UI is composed here.
│   │   │   │   ├── ProfileComponent.tsx        # A read-only profile view is rendered here.
│   │   │   │   └── UpdateProfile.tsx           # Profile editing is handled here.
│   │   │   └── VerticalMotionIndicator.tsx     # A loading/motion indicator is rendered here.
│   │   ├── hooks                               # Form helpers and grid keyboard controls are contained here.
│   │   │   ├── useGridKeyboardControls.ts      # Keyboard navigation for the board is implemented here.
│   │   │   └── useReactFormHook.ts             # Form-state helper logic is implemented here.
│   │   ├── images                              # Static image assets are stored here.
│   │   ├── main.tsx                            # The SPA entry point and router are defined here.
│   │   ├── pages
│   │   │   ├── IndexPage.tsx                   # The landing page is rendered here.
│   │   │   ├── Kanban.tsx                      # The Tasks/Kanban board page is rendered here.
│   │   │   ├── LoginPage.tsx                   # The login page is rendered here.
│   │   │   ├── ManageTeam.tsx                  # The team-management page is rendered here.
│   │   │   ├── NotFound.tsx                    # A 404 fallback page is rendered here.
│   │   │   ├── PlanPhases.tsx                  # The phase-planning page is rendered here.
│   │   │   └── Unauthorized.tsx                # An unauthorized-access page is rendered here.
│   │   ├── styles                              # App CSS tokens, typography, and layout are defined here.
│   │   │   └── index.css
│   │   └── utils
│   │       └── phaseDates.ts                   # Phase-date calculations are implemented here.
│   ├── tsconfig.app.json                       # TypeScript config for app source is defined here.
│   ├── tsconfig.json                           # The root frontend TypeScript config is defined here.
│   ├── tsconfig.node.json                      # TypeScript config for build tooling is defined here.
│   └── vite.config.ts                          # Vite build/dev-server settings are defined here.
├── LICENSE                                     # The MIT license is provided here.
├── package.json                                # Root/backend dependencies and scripts are declared here.
├── package-lock.json
├── README.md                                   # Project documentation is provided here.
├── res                                         # README screenshots and design assets are stored here.
│   ├── login.png
│   ├── manageteam.png
│   ├── phases.png
│   ├── tasks.png
│   ├── thumb.png
│   ├── updateprofile.png
│   └── wireframes                              # Early board wireframes and a combined PDF/image are stored here.
│       ├── Agility Board - Page 1.png
│       ├── Agility Board - Page 2.png
│       ├── Agility Board - Page 3.png
│       ├── Agility Board - Page 4.png
│       ├── Agility Board - Page 5.png
│       ├── Agility Board - Page 6.png
│       ├── Agility Board - Page 7.png
│       ├── Agility Board.pdf
│       └── Agility Board.png
├── src
│   ├── backend
│   │   ├── authentication
│   │   │   ├── Authenticator.ts                # The Passport Local strategy is configured here.
│   │   │   ├── CredentialsManager.ts           # Password hashing/verification with bcrypt is implemented here.
│   │   │   └── ExpressUserType.d.ts            # Express user-type augmentation is declared here.
│   │   ├── database
│   │   │   ├── Database.ts                     # A MongoDB connection singleton is managed here.
│   │   │   ├── PhaseOperations.ts              # Phase-related DB operations are implemented here.
│   │   │   ├── TicketOperations.ts             # Ticket-related DB operations are implemented here.
│   │   │   └── UserOperations.ts               # User-related DB operations are implemented here.
│   │   ├── ExpressTypes.d.ts                   # Shared Express type declarations are provided here.
│   │   ├── index.ts                            # The Express app is created, routes are mounted, and the SPA is served here.
│   │   ├── managerTeam.ts                      # Manager-developer team helpers are implemented here.
│   │   ├── middleware
│   │   │   └── AuthenticationMiddleware.ts     # Auth and account-type guards are implemented here.
│   │   └── routes
│   │       ├── Auth.ts                         # Register, login, logout, and profile routes are defined here.
│   │       ├── Developers.ts                   # Developer assignment routes are defined here.
│   │       ├── Kanban.ts                       # Ticket CRUD and status-move routes are defined here.
│   │       └── Phases.ts                       # Phase CRUD and phase-ticket routes are defined here.
│   └── shared
│       └── models
│           ├── Kanban.ts                       # Shared Kanban/ticket-status types are defined here.
│           ├── Phases.ts                       # Shared phase types are defined here.
│           ├── Tickets.ts                      # Shared ticket types are defined here.
│           └── Users.ts                        # Shared user types are defined here.
└── tsconfig.json                               # The root TypeScript project config is defined here.
```

## Installation and Local Development

1. **Clone the repository using git**

   ```bash
   git clone https://github.com/vasiliosnicholas/Agility.git
   cd Agility
   ```

2. **Ensure Node.js v24 is installed on your system**

   ```bash
   node --version
   ```

3. **Install project dependencies for the backend/root and frontend**

   ```bash
   npm install
   cd frontend
   npm install
   cd ..
   ```

4. **Install MongoDB on your system using a container or natively and start the MongoDB instance.**

5. **(Optional) Import mock tickets from `./data/seed-tickets.json` into your tickets collection.**

6. **Using `.env.example` for the required environment variables, fill out a `.env` file:**

   ```
   HOST=localhost
   PORT=3000
   SESSION_SECRET=<a strong secret used to sign session cookies>
   MONGODB_URI=<mongodb://localhost:27017 or your MongoDB Atlas URI>
   DB_NAME=agility
   DB_USERS_COLLECTION_NAME=users
   DB_TICKETS_COLLECTION_NAME=tickets
   DB_PHASES_COLLECTION_NAME=phases
   NODE_ENV=development
   ```

7. **Build the frontend (required before `npm start`, and useful so Express can serve the SPA):**

   ```bash
   cd frontend
   npm run build
   cd ..
   ```

8. **Choose how to run the app:**

   - For **local development**, run the backend and frontend in separate terminals:

     ```bash
     npm run dev
     ```

     ```bash
     cd frontend
     npm run dev
     ```

     The Vite dev server proxies API requests to the Express backend on port 3000.

   - For a **production-style local run**, build both projects, then start Express:

     ```bash
     cd frontend && npm run build && cd ..
     npm run build
     npm start
     ```

## Third-Party APIs & Libraries & Deployment Environments

- **Express** — Web framework for Node.js used to build the REST API and serve the built React SPA.
- **MongoDB Node.js Driver** — Official driver used to connect to and query MongoDB collections.
- **Passport / passport-local** — Session-based authentication with a local username/password strategy.
- **bcrypt** — Password hashing for stored user credentials.
- **express-session** — Server-side sessions and signed cookies.
- **React + Vite** — SPA frontend toolchain and UI runtime.
- **React Router** — Client-side routing for Tasks, Plan Phases, Manage Team, and auth pages.
- **Bootstrap 5 / React-Bootstrap** — Responsive layout and UI components.
- **react-hook-form + Yup** — Form state and validation for auth and profile flows.
- **use-immer** — For deeply reactive state.
- **Render** — Deployment environment for the Express backend (and served frontend).
- **MongoDB Atlas** — Deployment environment for the MongoDB database.

## Gen AI Usage Disclosure

- Gemini used for searching through documentation and finding helpful resources.
- Cursor AI used for generating this README and mock data.

## License

This project is licensed under the MIT License.

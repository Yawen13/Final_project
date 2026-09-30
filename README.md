# Final_project

Frontend Team
Each team member focuses on specific core features and pages to avoid code conflicts during parallel development:

## Team & Task Allocation

### Frontend Team
Each member focuses on specific pages and features to enable parallel development without conflicts:

| Member | Branch | Assigned Features / Components |
| :--- | :--- | :--- |
| **Joseph** | `frontend-Joseph` | • Login & Signup (`Login.jsx`)<br>• Notifications (`Notifications.jsx`)<br>• Direct Messages (`Message.jsx`)<br>• AI Assistant (`Assistant.jsx`) |
| **Shiro** | `frontend-Shiro` | • Homepage / Feed (`Home.jsx`)<br>• Explore / Search (`Explore.jsx`) |
| **KP** | `frontend-KP` | • Navigation Bar (`Navbar.jsx` / `Sidebar.jsx`)<br>• Bookmark (`Bookmark.jsx`)<br>• Community (`Community.jsx`)<br>• Premium / Subscription (`Premium.jsx`)<br>• User Profile (`Profile.jsx`) |

---

###  Backend Team
The backend developers share responsibilities for server-side endpoints, authentication, and database schemas:

| Member | Branch | Primary Focus |
| :--- | :--- | :--- |
| **Monica** | `Backend-Monica` | Backend |
| **Packeu** | `Backend-Packeu` | Backend |


Git Branching Convention
To maintain a clean repository and ensure smooth collaboration, we use feature-based and member-specific branches:

main: Production-ready, stable codebase.

frontend-Joseph: Frontend development for Login, Messages, Notifications & Assistant.

frontend-Shiro: Frontend development for Homepage & Explore.

frontend-KP: Frontend development for Navigation Bar, Profile, Bookmark, Community & Premium.

Backend-Monica: Backend development by Monica.

Backend-Packeu: Backend development by Packeu.

Collaboration Rule: Never push directly to main. Always develop on your dedicated branch and create a Pull Request (PR) to merge into main.

Getting Started
1. Clone the repository
Bash
git clone https://github.com/Yawen13/Final_project.git
cd Final_project
2. Frontend Setup
Bash
cd frontend
npm install
npm run dev
3. Backend Setup
Bash
cd backend
npm install
npm start
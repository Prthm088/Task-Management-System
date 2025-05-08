# 🗂️ Task Management System

A full-featured task management application with user authentication, team collaboration, and interactive dashboards built using Next.js, MongoDB, and Tailwind CSS.

## 🔑 Key Features

### 1. User Authentication
- Secure registration & login (bcrypt password hashing)
- JWT-based session management (NextAuth.js)
- Server-side route protection

### 2. Task Management
- Full CRUD operations on tasks
- Task properties: `title`, `description`, `due date`, `priority`, `status`
- Detailed task view and in-place editing

### 3. Team Collaboration
- Assign tasks to team members
- Notifications for task assignments
- User management & team selection

### 4. Dashboard
- View tasks assigned to you
- See tasks you’ve created
- Track overdue tasks
- Visual task statistics and completion rates

### 5. Search & Filter
- Search by title and description
- Filter by `status`, `priority`, and `due date`
- Sortable task listings

## 🚀 Getting Started


### 1. Clone the Repo

git clone https://github.com/Prthm088/Task-Management-System.git
cd Task-Management-System

### 2.Install Dependencies
npm install

### 3. Set Up Environment Variables
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=your_mongo_connection_string

### 4. Run the App
npm run dev

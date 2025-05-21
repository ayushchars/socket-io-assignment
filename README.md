# 🚀 Socket.IO Assignment

A unified monorepo for building a real-time chat application using **Socket.IO**, with a **Node.js + Express** backend and a **React + Vite** frontend.

---

## 📁 Project Structure

socket-io-assignment/
├── backend/ # Node.js + Socket.IO server
├── frontend/ # React client using Vite
├── package.json # Root file to manage both frontend and backend


### 1. Clone the Repository

```bash
git clone https://github.com/ayushchars/socket-io-assignment.git
cd socket-io-assignment


Install Dependencies

# Install root tools (like concurrently)
npm install

# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend


Run the App (Dev Mode)

npm run dev
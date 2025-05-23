import React, { useState } from "react";
import { useAuth } from "react-oidc-context";

function App() {
  const auth = useAuth();
  const API_URL = "https://6jwss12iel.execute-api.eu-north-1.amazonaws.com/prod/Tasks";
  const [tasks, setTasks] = useState([]);

  const callGetTasks = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.user?.id_token}`,
        },
      });

      const raw = await res.json();
      const data = typeof raw.body === "string" ? JSON.parse(raw.body) : raw;
      console.log("Parsed Tasks:", data);
      setTasks(data);
    } catch (err) {
      console.error("GET failed:", err);
    }
  };

  const callCreateTask = async () => {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.user?.id_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      alert("✅ Task created: " + JSON.stringify(data));
      callGetTasks();
    } catch (err) {
      alert("❌ Failed: " + err.message);
    }
  };

  const callUpdateTask = async (taskId, newTitle, newDescription) => {
    try {
      const res = await fetch(`${API_URL}/${taskId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${auth.user?.id_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });
      const data = await res.json();
      console.log("Updated:", data);
      await callGetTasks();
    } catch (err) {
      console.error("PUT failed:", err);
    }
  };

  const callDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`${API_URL}/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.user?.id_token}`,
        },
      });
      if (res.ok) {
        console.log("Deleted task:", taskId);
        await callGetTasks();
      } else {
        console.error("DELETE failed with status", res.status);
      }
    } catch (err) {
      console.error("DELETE failed:", err);
    }
  };

  const signOutRedirect = () => {
    const clientId = "2vgs5c2ooil8rfa6qvbm1r6p92";
    const logoutUri = "http://localhost:4000";
    const cognitoDomain = "https://eu-north-1p8r5rksqd.auth.eu-north-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Error: {auth.error.message}</div>;

  if (auth.isAuthenticated) {
    return (
      <div>
        <pre>Hello: {auth.user?.profile.email}</pre>
        <pre>ID Token: {auth.user?.id_token}</pre>
        <pre>Access Token: {auth.user?.access_token}</pre>
        <pre>Refresh Token: {auth.user?.refresh_token}</pre>

        <button onClick={() => auth.removeUser()}>Sign out</button>

        <h3>Task Actions</h3>
        <button onClick={callGetTasks}>GET Tasks</button>

        <h3>Create Task</h3>
        <input type="text" id="taskTitle" placeholder="Title" />
        <input type="text" id="taskDescription" placeholder="Description" />
        <button onClick={callCreateTask}>Create Task</button>

        <h3>📋 Task List</h3>
        <ul>
          {tasks.map((task) => (
            <li key={task.taskId}>
              <strong>{task.title}</strong> — {task.description}
              <p>Status: {task.status}</p>
              <button onClick={() => callDeleteTask(task.taskId)}>Delete</button>
              <input type="text" placeholder="New title" onChange={(e) => task.newTitle = e.target.value} />
              <input type="text" placeholder="New description" onChange={(e) => task.newDesc = e.target.value} />
              <button onClick={() => callUpdateTask(task.taskId, task.newTitle, task.newDesc)}>Update</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h1>Task Manager</h1>
      <div className="auth-buttons">
        <button onClick={() => auth.signinRedirect()}>Sign in</button>
      </div>
    </div>
  );
  
}

export default App;

"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, ListTodo, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Task = {
  id: string;
  title: string;
  createdAt: number;
  completed: boolean;
};

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "task-manager.tasks";

export default function TaskManagementApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as Task[];
      setTasks(parsed);
    } catch {
      setTasks([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const remainingTasks = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((task) => !task.completed);
    if (filter === "completed") return tasks.filter((task) => task.completed);
    return tasks;
  }, [tasks, filter]);

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = title.trim();
    if (!value) return;

    const nextTask: Task = {
      id: crypto.randomUUID(),
      title: value,
      completed: false,
      createdAt: Date.now(),
    };

    setTasks((current) => [nextTask, ...current]);
    setTitle("");
  };

  const toggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const clearCompleted = () => {
    setTasks((current) => current.filter((task) => !task.completed));
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <motion.section
        className="glass-card p-6 md:p-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <ListTodo className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Task Manager</h1>
            <p className="text-sm text-muted-foreground">
              Keep track of what matters today.
            </p>
          </div>
        </div>

        <form className="mb-6 flex flex-col gap-3 sm:flex-row" onSubmit={addTask}>
          <Input
            aria-label="New task"
            placeholder="Add a new task..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Button type="submit" className="sm:w-auto">
            Add Task
          </Button>
        </form>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {(["all", "active", "completed"] as const).map((option) => (
              <Button
                key={option}
                size="sm"
                variant={filter === option ? "primary" : "outline"}
                onClick={() => setFilter(option)}
                type="button"
                className="capitalize"
              >
                {option}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {remainingTasks} task{remainingTasks === 1 ? "" : "s"} remaining
          </p>
        </div>

        <ul className="space-y-2">
          {filteredTasks.length === 0 ? (
            <li className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No tasks yet. Add your first one above.
            </li>
          ) : (
            filteredTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded-lg border bg-white p-3"
              >
                <button
                  aria-label={`Toggle task ${task.title}`}
                  className="text-primary"
                  onClick={() => toggleTask(task.id)}
                  type="button"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>

                <span
                  className={`flex-1 text-sm md:text-base ${
                    task.completed ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  {task.title}
                </span>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground"
                  aria-label={`Delete task ${task.title}`}
                  onClick={() => deleteTask(task.id)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))
          )}
        </ul>

        {tasks.some((task) => task.completed) && (
          <div className="mt-6 flex justify-end">
            <Button variant="outline" size="sm" onClick={clearCompleted} type="button">
              Clear completed
            </Button>
          </div>
        )}
      </motion.section>
    </main>
  );
}

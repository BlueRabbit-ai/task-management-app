"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { Plus, Trash2, Calendar, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/date-picker"

interface Task {
  id: string
  content: string
  priority: "low" | "medium" | "high"
  dueDate: Date | null
  description: string
}

interface Column {
  id: string
  title: string
  tasks: Task[]
}

const initialData: { [key: string]: Column } = {
  todo: {
    id: "todo",
    title: "To Do",
    tasks: [
      {
        id: "task-1",
        content: "Create project structure",
        priority: "high",
        dueDate: new Date(2025, 1, 15),
        description: "Set up the initial project structure and dependencies",
      },
      {
        id: "task-2",
        content: "Implement drag and drop",
        priority: "medium",
        dueDate: new Date(2025, 1, 20),
        description: "Add drag and drop functionality for tasks",
      },
    ],
  },
  inProgress: {
    id: "inProgress",
    title: "In Progress",
    tasks: [
      {
        id: "task-3",
        content: "Design UI components",
        priority: "high",
        dueDate: new Date(2025, 1, 18),
        description: "Create and style UI components for the app",
      },
    ],
  },
  done: {
    id: "done",
    title: "Done",
    tasks: [
      {
        id: "task-4",
        content: "Set up development environment",
        priority: "low",
        dueDate: new Date(2025, 1, 10),
        description: "Configure development tools and environment",
      },
    ],
  },
}

const priorityColors = {
  low: "border-blue-400 bg-blue-50",
  medium: "border-yellow-400 bg-yellow-50",
  high: "border-red-400 bg-red-50",
}

export default function TaskManagementApp() {
  const [columns, setColumns] = useState(initialData)
  const [newTask, setNewTask] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium")
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | null>(null)
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    const savedColumns = localStorage.getItem("taskColumns")
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("taskColumns", JSON.stringify(columns))
  }, [columns])

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    const start = columns[source.droppableId]
    const finish = columns[destination.droppableId]

    if (start === finish) {
      const newTasks = Array.from(start.tasks)
      const [reorderedItem] = newTasks.splice(source.index, 1)
      newTasks.splice(destination.index, 0, reorderedItem)

      const newColumn = {
        ...start,
        tasks: newTasks,
      }

      setColumns({
        ...columns,
        [newColumn.id]: newColumn,
      })
    } else {
      const startTasks = Array.from(start.tasks)
      const [movedItem] = startTasks.splice(source.index, 1)
      const newStart = {
        ...start,
        tasks: startTasks,
      }

      const finishTasks = Array.from(finish.tasks)
      finishTasks.splice(destination.index, 0, movedItem)
      const newFinish = {
        ...finish,
        tasks: finishTasks,
      }

      setColumns({
        ...columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      })
    }
  }

  const addTask = () => {
    if (newTask.trim() === "") return
    const newTaskId = `task-${Date.now()}`
    const task: Task = {
      id: newTaskId,
      content: newTask,
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      description: newTaskDescription,
    }
    const updatedTodoColumn = {
      ...columns.todo,
      tasks: [task, ...columns.todo.tasks],
    }
    setColumns({
      ...columns,
      todo: updatedTodoColumn,
    })
    setNewTask("")
    setNewTaskPriority("medium")
    setNewTaskDueDate(null)
    setNewTaskDescription("")
  }

  const deleteTask = (columnId: string, taskId: string) => {
    const updatedColumn = {
      ...columns[columnId],
      tasks: columns[columnId].tasks.filter((task) => task.id !== taskId),
    }
    setColumns({
      ...columns,
      [columnId]: updatedColumn,
    })
  }

  const updateTask = (task: Task) => {
    const columnId = Object.keys(columns).find((key) => columns[key].tasks.some((t) => t.id === task.id))
    if (columnId) {
      const updatedColumn = {
        ...columns[columnId],
        tasks: columns[columnId].tasks.map((t) => (t.id === task.id ? task : t)),
      }
      setColumns({
        ...columns,
        [columnId]: updatedColumn,
      })
    }
    setEditingTask(null)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Task Management App</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Input type="text" placeholder="Add a new task" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
        <Select value={newTaskPriority} onValueChange={(value: "low" | "medium" | "high") => setNewTaskPriority(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <DatePicker date={newTaskDueDate} setDate={setNewTaskDueDate} />
        <Textarea
          placeholder="Task description"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          className="col-span-full"
        />
        <Button onClick={addTask} className="col-span-full">
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(columns).map((column) => (
            <Card key={column.id} className="h-full">
              <CardHeader>
                <CardTitle>{column.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-[200px] transition-colors ${snapshot.isDraggingOver ? "bg-secondary" : ""}`}
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-background p-3 mb-2 rounded-md shadow-sm border-l-4 ${
                                priorityColors[task.priority]
                              } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{task.content}</p>
                                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    <span className="capitalize">{task.priority}</span>
                                    {task.dueDate && (
                                      <>
                                        <Calendar className="h-4 w-4 ml-2 mr-1" />
                                        <span>{task.dueDate.toLocaleDateString()}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" onClick={() => setEditingTask(task)}>
                                        Edit
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Edit Task</DialogTitle>
                                      </DialogHeader>
                                      {editingTask && (
                                        <div className="grid gap-4 py-4">
                                          <Input
                                            value={editingTask.content}
                                            onChange={(e) =>
                                              setEditingTask({ ...editingTask, content: e.target.value })
                                            }
                                          />
                                          <Select
                                            value={editingTask.priority}
                                            onValueChange={(value: "low" | "medium" | "high") =>
                                              setEditingTask({ ...editingTask, priority: value })
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="low">Low</SelectItem>
                                              <SelectItem value="medium">Medium</SelectItem>
                                              <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <DatePicker
                                            date={editingTask.dueDate}
                                            setDate={(date) => setEditingTask({ ...editingTask, dueDate: date })}
                                          />
                                          <Textarea
                                            value={editingTask.description}
                                            onChange={(e) =>
                                              setEditingTask({ ...editingTask, description: e.target.value })
                                            }
                                            placeholder="Task description"
                                          />
                                          <Button onClick={() => updateTask(editingTask)}>Save Changes</Button>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                  <Button variant="ghost" size="icon" onClick={() => deleteTask(column.id, task.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}


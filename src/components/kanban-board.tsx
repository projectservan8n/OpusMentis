'use client'

import { useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, GripVertical, Edit2, Trash2 } from 'lucide-react'

interface KanbanTask {
  id: string
  title: string
  description: string
  column: 'to-learn' | 'learning' | 'mastered'
  priority: 'low' | 'medium' | 'high'
}

interface KanbanBoardProps {
  tasks: KanbanTask[]
  onUpdateTasks: (tasks: KanbanTask[]) => void
}

const columns = [
  { id: 'to-learn', title: 'To Learn', color: 'bg-red-50 border-red-200' },
  { id: 'learning', title: 'Learning', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'mastered', title: 'Mastered', color: 'bg-green-50 border-green-200' }
] as const

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-red-100 text-red-800'
}

const ItemType = 'KANBAN_TASK'

interface DragItem {
  id: string
  type: string
  column: string
}

function KanbanTask({ task, onMove, onEdit, onDelete }: {
  task: KanbanTask
  onMove: (taskId: string, newColumn: string) => void
  onEdit: (task: KanbanTask) => void
  onDelete: (taskId: string) => void
}) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id: task.id, type: ItemType, column: task.column },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <div
      ref={drag as any}
      className={`kanban-card ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="h-6 w-6 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      <Badge variant="secondary" className={priorityColors[task.priority]}>
        {task.priority}
      </Badge>
    </div>
  )
}

function KanbanColumn({
  column,
  tasks,
  onMove,
  onEdit,
  onDelete,
  onAddTask
}: {
  column: typeof columns[number]
  tasks: KanbanTask[]
  onMove: (taskId: string, newColumn: string) => void
  onEdit: (task: KanbanTask) => void
  onDelete: (taskId: string) => void
  onAddTask: (column: string) => void
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemType,
    drop: (item: DragItem) => {
      if (item.column !== column.id) {
        onMove(item.id, column.id)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  return (
    <div
      ref={drop}
      className={`kanban-column ${column.color} ${
        isOver && canDrop ? 'ring-2 ring-primary' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{column.title}</h3>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{tasks.length}</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddTask(column.id)}
            className="h-6 w-6 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <KanbanTask
            key={task.id}
            task={task}
            onMove={onMove}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

function TaskDialog({
  task,
  isOpen,
  onClose,
  onSave,
  defaultColumn
}: {
  task?: KanbanTask
  isOpen: boolean
  onClose: () => void
  onSave: (task: Partial<KanbanTask>) => void
  defaultColumn?: string
}) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    column: task?.column || defaultColumn || 'to-learn'
  })

  const handleSave = () => {
    if (!formData.title.trim()) return

    onSave({
      id: task?.id || `task-${Date.now()}`,
      ...formData
    } as KanbanTask)

    onClose()

    if (!task) {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        column: defaultColumn || 'to-learn'
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update task details' : 'Create a new learning task'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What do you need to learn?"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details about this learning objective..."
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Column</label>
              <select
                value={formData.column}
                onChange={(e) => setFormData({ ...formData, column: e.target.value as any })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="to-learn">To Learn</option>
                <option value="learning">Learning</option>
                <option value="mastered">Mastered</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.title.trim()}>
              {task ? 'Update' : 'Add'} Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function KanbanBoard({ tasks, onUpdateTasks }: KanbanBoardProps) {
  const [editingTask, setEditingTask] = useState<KanbanTask | undefined>()
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [addingToColumn, setAddingToColumn] = useState<string>('')

  const moveTask = (taskId: string, newColumn: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, column: newColumn as any } : task
    )
    onUpdateTasks(updatedTasks)
  }

  const addTask = (column: string) => {
    setAddingToColumn(column)
    setIsAddingTask(true)
  }

  const saveTask = (taskData: Partial<KanbanTask>) => {
    if (editingTask) {
      // Update existing task
      const updatedTasks = tasks.map(task =>
        task.id === editingTask.id ? { ...task, ...taskData } : task
      )
      onUpdateTasks(updatedTasks)
      setEditingTask(undefined)
    } else {
      // Add new task
      onUpdateTasks([...tasks, taskData as KanbanTask])
      setIsAddingTask(false)
      setAddingToColumn('')
    }
  }

  const deleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      onUpdateTasks(tasks.filter(task => task.id !== taskId))
    }
  }

  const tasksByColumn = columns.reduce((acc, column) => {
    acc[column.id] = tasks.filter(task => task.column === column.id)
    return acc
  }, {} as Record<string, KanbanTask[]>)

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Learning Progress</h3>
            <p className="text-sm text-muted-foreground">
              Drag tasks between columns to track your learning progress
            </p>
          </div>
          <Button onClick={() => addTask('to-learn')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasksByColumn[column.id] || []}
              onMove={moveTask}
              onEdit={setEditingTask}
              onDelete={deleteTask}
              onAddTask={addTask}
            />
          ))}
        </div>

        <TaskDialog
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(undefined)}
          onSave={saveTask}
        />

        <TaskDialog
          isOpen={isAddingTask}
          onClose={() => {
            setIsAddingTask(false)
            setAddingToColumn('')
          }}
          onSave={saveTask}
          defaultColumn={addingToColumn}
        />
      </div>
    </DndProvider>
  )
}
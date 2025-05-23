'use client';

import { useState } from 'react';
import { TaskType, Todo } from '../types/todo';
import { createTask } from '../services/api';
import { addTask } from '../services/blockchain';

interface TodoFormProps {
  onAddTodo: (todo: Todo) => void;
}

export default function TodoForm({ onAddTodo }: TodoFormProps) {
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [taskType, setTaskType] = useState<TaskType>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Task title is required');
      return;
    }
    
    try {
      setIsSubmitting(true);

      const newTask = await createTask({
        content,
        description: description.trim() || undefined,
        priority: 'medium',
        dueDate: dueDate || undefined,
        taskType,
      });

      try {
        if (!newTask.taskHash) {
          throw new Error('Task hash is missing');
        }
        const result = await addTask(newTask.taskHash);

        newTask.txHash = result.txHash;
      } catch (blockchainError) {
        console.error('Error adding task to blockchain (continuing anyway):', blockchainError);
      }

      setContent('');
      setDescription('');
      setTaskType('personal');
      setDueDate('');

      onAddTodo(newTask);
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-2">
      <h2 className="text-xl font-semibold mb-4 text-gray-200 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-accent-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
        New Task
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Task title"
          className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 
          bg-dark-700 border border-purple-500/30 text-white placeholder-gray-400"
        />
      </div>
      
      <div className="mb-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description (optional)"
          rows={3}
          className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 
          bg-dark-700 border border-purple-500/30 text-white placeholder-gray-400 resize-none"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Due Date (Optional)</label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 
            bg-dark-700 border border-purple-500/30 text-white text-sm"
          />
        </div>
        
        <div>
          <div className="bg-dark-800 p-3 rounded-lg border border-accent-400/20 text-sm text-gray-300">
            <p className="flex items-center text-accent-400 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              AI Assistant
            </p>
            <p className="text-xs text-gray-400 mb-2">
              Our AI will analyze your task and provide:
            </p>
            <ul className="text-xs text-gray-400 ml-2 space-y-1">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-indigo-400 mr-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Suggested priority level</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-indigo-400 mr-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Helpful productivity tips</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-indigo-400 mr-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Time management recommendations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Task Type</label>
        <div className="grid grid-cols-4 gap-2">
          <label className={`flex items-center justify-center p-2 rounded-lg cursor-pointer border ${taskType === 'personal' ? 'bg-blue-900/20 border-blue-500/30 text-blue-400' : 'border-dark-600 text-gray-400'}`}>
            <input
              type="radio"
              name="taskType"
              value="personal"
              checked={taskType === 'personal'}
              onChange={() => setTaskType('personal')}
              className="sr-only"
            />
            <span className="text-sm">Personal</span>
          </label>
          <label className={`flex items-center justify-center p-2 rounded-lg cursor-pointer border ${taskType === 'work' ? 'bg-purple-900/20 border-purple-500/30 text-purple-400' : 'border-dark-600 text-gray-400'}`}>
            <input
              type="radio"
              name="taskType"
              value="work"
              checked={taskType === 'work'}
              onChange={() => setTaskType('work')}
              className="sr-only"
            />
            <span className="text-sm">Work</span>
          </label>
          <label className={`flex items-center justify-center p-2 rounded-lg cursor-pointer border ${taskType === 'study' ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'border-dark-600 text-gray-400'}`}>
            <input
              type="radio"
              name="taskType"
              value="study"
              checked={taskType === 'study'}
              onChange={() => setTaskType('study')}
              className="sr-only"
            />
            <span className="text-sm">Study</span>
          </label>
          <label className={`flex items-center justify-center p-2 rounded-lg cursor-pointer border ${taskType === 'other' ? 'bg-gray-800 border-gray-600 text-gray-300' : 'border-dark-600 text-gray-400'}`}>
            <input
              type="radio"
              name="taskType"
              value="other"
              checked={taskType === 'other'}
              onChange={() => setTaskType('other')}
              className="sr-only"
            />
            <span className="text-sm">Other</span>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all duration-200 flex items-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Add Task'}
        </button>
      </div>
    </form>
  );
} 
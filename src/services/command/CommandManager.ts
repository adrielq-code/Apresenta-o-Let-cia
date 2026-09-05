import { Command } from './types';

export class CommandManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private readonly maxStackSize: number;
  private listeners: Set<() => void> = new Set();
  public onFeedback?: (message: string, type: 'undo' | 'redo') => void;

  constructor(maxStackSize = 50) {
    this.maxStackSize = maxStackSize;
  }

  /**
   * Executes a command and pushes it onto the undo stack.
   * Clears the redo stack as the timeline diverges.
   */
  public execute(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.notify();
  }

  /**
   * Undoes the most recent command on the undo stack.
   * Pushes it onto the redo stack.
   */
  public undo(): boolean {
    if (this.undoStack.length === 0) return false;

    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);

    if (this.onFeedback) {
      this.onFeedback(`Desfeito: ${command.name}`, 'undo');
    }

    this.notify();
    return true;
  }

  /**
   * Redoes the most recently undone command.
   * Pushes it back onto the undo stack.
   */
  public redo(): boolean {
    if (this.redoStack.length === 0) return false;

    const command = this.redoStack.pop()!;
    if (command.redo) {
      command.redo();
    } else {
      command.execute();
    }
    this.undoStack.push(command);

    if (this.onFeedback) {
      this.onFeedback(`Refeito: ${command.name}`, 'redo');
    }

    this.notify();
    return true;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public getUndoCommandName(): string | undefined {
    return this.undoStack[this.undoStack.length - 1]?.name;
  }

  public getRedoCommandName(): string | undefined {
    return this.redoStack[this.redoStack.length - 1]?.name;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in CommandManager listener:', err);
      }
    });
  }
}

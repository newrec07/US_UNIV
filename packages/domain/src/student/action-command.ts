/**
 * Commands a user can apply to an existing Action. `suggested` is the
 * agent-generated initial state and is never a target of a user command.
 */
export interface AcceptActionCommand {
  type: 'accept_action';
  actionId: string;
}

export interface StartActionCommand {
  type: 'start_action';
  actionId: string;
}

export interface CompleteActionCommand {
  type: 'complete_action';
  actionId: string;
}

export interface DismissActionCommand {
  type: 'dismiss_action';
  actionId: string;
  reason?: string;
}

export type ActionCommand =
  | AcceptActionCommand
  | StartActionCommand
  | CompleteActionCommand
  | DismissActionCommand;

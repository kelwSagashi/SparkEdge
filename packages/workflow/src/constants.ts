export const LOG_LEVELS = ['silent', 'error', 'warn', 'info', 'debug'] as const;

export const LOG_SCOPES = [
    'concurrency',
    'push',
    'waiting-executions',
    'task-runner',
    'task-runner-py',
    'workflow-activation',
    'cron',
] as const;

export const ExecutionStatusList = [
    'canceled',
    'crashed',
    'error',
    'new',
    'running',
    'success',
    'unknown',
    'waiting',
] as const;

export const ContextTypeValues = {
    FLOW: 'flow',
    NODE: 'node',
};

export const NodeConnectionTypes = {
    Main: 'main',
} as const;

export const BuilderNodes = {
    INPUT: 'input',
    OUTPUT: 'output',
    ORG: 'organization',
    SCHEDULE: 'schedule',
    TRANSFORM: 'transform',
    TRIGGER: 'trigger',
    CUSTOM: 'custom',
    BASE: 'base'
} as const;

export const BuilderNodeValues = Object.values(BuilderNodes);

export type BuilderNodeTypes = (typeof BuilderNodes)[keyof typeof BuilderNodes];
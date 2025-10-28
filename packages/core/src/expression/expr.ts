import vm from 'node:vm'

interface EvalContext {
    $parameter?: Record<string, any>;
    $json?: Record<string, any>;
    $env?: NodeJS.ProcessEnv;
}

export class Expression {
    isExpression(expr: unknown): expr is string {
        if (typeof expr !== 'string') return false;

        return expr.charAt(0) === '=';
    }

    evaluateExpression(expression: unknown, context: EvalContext) {
        if (!this.isExpression(expression)) {
            return {
                result: null
            };
        }

        const code = expression.slice(3, -2).trim();

        const sandbox = {
            ...context
        };

        const vmContext = vm.createContext(sandbox);

        const result = vm.runInContext(code, vmContext);
        return {
            result: result
        }
    }
}
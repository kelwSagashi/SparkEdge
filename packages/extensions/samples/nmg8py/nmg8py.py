"""
NMG8 Python mini-SDK - atualizado

Funcionalidades:
 - procedural: @Input / @Output / @Run decoram a função; nmg8py.run(main) roda
 - OO: @Node (ou @Node()) marca a classe como node, podemos não herdar de Node
 - python script.py --schema  -> imprime schema json (inputs/outputs)
 - execução normal: espera JSON no stdin quando não interativo
 - validações: evita mistura procedural + OO, erros claros
"""
from __future__ import annotations
import sys, json, inspect, traceback
from typing import get_type_hints, get_origin, get_args, Any, Dict, List, Union, Optional

def type_to_str(tp: Any) -> str:
    try:
        origin = get_origin(tp)
        args = get_args(tp)
        if origin is None:
            if hasattr(tp, "__name__"): return tp.__name__
            return str(tp)
        if origin in (list, List): return f"List[{type_to_str(args[0]) if args else 'Any'}]"
        if origin in (dict, Dict):
            k = type_to_str(args[0]) if args else 'Any'
            v = type_to_str(args[1]) if len(args) > 1 else 'Any'
            return f"Dict[{k},{v}]"
        if origin is Union: return " | ".join(type_to_str(a) for a in args)
        return str(tp)
    except Exception:
        return str(tp)


# ---------- registries / small classes ----------
# ALTERADO: OutputRegistry agora armazena metadados (como o tipo)
class OutputRegistry:
    def __init__(self):
        self.data: Dict[str, Any] = {}
        # Agora é um dicionário para armazenar mais informações
        self.definitions: Dict[str, Dict[str, Any]] = {
            'stdout': {'name': 'stdout', 'type': Any},
            'stderr': {'name': 'stderr', 'type': Dict[str, str]}
        }

    def add(self, name: str, type_: Any = Any):
        """Define uma saída com nome e tipo."""
        self.definitions[name] = {"name": name, "type": type_}

    def set_data(self, name: str, data: Any):
        if name not in self.definitions:
            raise ValueError(f"Output '{name}' not declared. Use @Output('{name}') or nmg8py.outputs.add('{name}') before setting.")
        self.data[name] = data

    def add_data(self, name: str, data: Any):
        self.set_data(name, data)

class InputRegistry:
    def __init__(self):
        self.fields: Dict[str, Dict[str, Any]] = {}
    def add(self, name: str, required: bool=False, type_: Any=str):
        self.fields[name] = {"name": name, "required": required, "type": type_}
    def clear(self):
        self.fields.clear()


# ... (ensure_meta não muda) ...
def ensure_meta(obj):
    if not hasattr(obj, "__nmg8_meta__"):
        obj.__nmg8_meta__ = {"inputs": {}, "outputs": {}, "run_method": None}
    return obj.__nmg8_meta__


# ---------- decorators ----------
def Input(name: str=None, required: bool=False, type: Any=Any):
    def deco(target):
        # ... (lógica do Input não muda) ...
        if inspect.isfunction(target):
            meta = getattr(target, "__nmg8_proc_meta__", None)
            if meta is None:
                target.__nmg8_proc_meta__ = {"inputs": {}, "outputs": {}, "run": False}
                meta = target.__nmg8_proc_meta__
            key = name or (target.__name__)
            meta["inputs"][key] = {"required": required, "type": type}
            return target
        if inspect.isclass(target):
            meta = ensure_meta(target)
            key = name or None
            if key is None: raise ValueError("@Input used on class must specify 'name' parameter")
            meta["inputs"][key] = {"required": required, "type": type}
            return target
        return target
    return deco

# ALTERADO: @Output agora aceita um tipo
def Output(name: str, type: Any = Any):
    """
    Register an output with a name and an optional type.
    """
    def deco(target):
        meta_key = "__nmg8_proc_meta__" if inspect.isfunction(target) else "__nmg8_meta__"
        
        if inspect.isfunction(target) or inspect.isclass(target):
            if not hasattr(target, meta_key):
                if inspect.isfunction(target):
                    setattr(target, meta_key, {"inputs": {}, "outputs": {}, "run": False})
                else:
                    ensure_meta(target)
            
            meta = getattr(target, meta_key)
            meta["outputs"][name] = {"type": type}
            return target
        return target
    return deco


# ... (Run, MainOut, Out, NodeDecorator, NodeBase não mudam fundamentalmente) ...
def Run(fn):
    if not inspect.isfunction(fn): return fn
    meta = getattr(fn, "__nmg8_proc_meta__", None)
    if meta is None:
        fn.__nmg8_proc_meta__ = {"inputs": {}, "outputs": {}, "run": True}
    else:
        meta["run"] = True
    fn.__nmg8_is_run_method__ = True
    return fn

def MainOut(fn):
    if not inspect.isfunction(fn): raise TypeError("@MainOut can only decorate methods.")
    fn.__nmg8_is_main_out__ = True
    return fn

def Out(name: str):
    if not isinstance(name, str) or not name: raise TypeError("@Out decorator requires a non-empty string name.")
    def decorator(fn):
        if not inspect.isfunction(fn): raise TypeError("@Out can only decorate methods.")
        fn.__nmg8_output_name__ = name
        return fn
    return decorator

def NodeDecorator(arg=None):
    def _decorate(clazz):
        meta = ensure_meta(clazz)
        clazz.__nmg8_is_node__ = True
        run_method_found = None
        for name, member in inspect.getmembers(clazz, predicate=inspect.isfunction):
            if hasattr(member, '__nmg8_is_run_method__'):
                if run_method_found: raise TypeError(f"Multiple @Run methods in {clazz.__name__}.")
                run_method_found = name
        if run_method_found:
            meta['run_method'] = run_method_found
        if "__init__" not in clazz.__dict__ or clazz.__init__ is object.__init__:
            def __init__(self, **kwargs):
                # ... (lógica do init não muda, mas a criação de outputs sim) ...
                hints = {k: v for k, v in get_type_hints(clazz, include_extras=True).items() if k not in ("outputs", "outputs_def") and not k.startswith("_")}
                defaults = {k: v for k, v in clazz.__dict__.items() if not k.startswith("_") and not callable(v) and k not in ("outputs", "outputs_def")}
                inputs_meta = meta.get("inputs", {})
                for name, typ in hints.items():
                    if name in kwargs: setattr(self, name, kwargs[name])
                    elif name in defaults: setattr(self, name, defaults[name])
                    elif name in inputs_meta and inputs_meta[name]["required"] is False: setattr(self, name, None)
                    elif (name in inputs_meta and inputs_meta[name].get("required")) or (name not in defaults): raise ValueError(f"Missing required input: {name}")
                for name, m in inputs_meta.items():
                    if name in hints: continue
                    if name in kwargs: setattr(self, name, kwargs[name])
                    elif "default" in m: setattr(self, name, m.get("default"))
                    elif m.get("required"): raise ValueError(f"Missing required input: {name}")
                    else: setattr(self, name, None)
                
                # ALTERADO: Lógica de criação de outputs
                self.outputs = OutputRegistry()
                # Adiciona outputs de decoradores
                for name, definition in meta.get("outputs", {}).items():
                    self.outputs.add(name, definition.get("type", Any))
                # Adiciona outputs da lista `outputs_def` (compatibilidade)
                for o_name in getattr(clazz, "outputs_def", []):
                    self.outputs.add(o_name)

            setattr(clazz, "__init__", __init__)
        else:
            orig_init = clazz.__init__
            def wrapped_init(self, *a, **kw):
                orig_init(self, *a, **kw)
                if not hasattr(self, "outputs"):
                    self.outputs = OutputRegistry()
                    # ALTERADO: Lógica de criação de outputs
                    for name, definition in meta.get("outputs", {}).items():
                        self.outputs.add(name, definition.get("type", Any))
                    for o_name in getattr(clazz, "outputs_def", []):
                        self.outputs.add(o_name)
            setattr(clazz, "__init__", wrapped_init)
        return clazz
    if inspect.isclass(arg): return _decorate(arg)
    return _decorate
Node = NodeDecorator

# ---------- base Node class (optional to inherit) ----------
class NodeBase:
    """
    Optional base class. Prefer using the @Node decorator on a plain class.
    Provides an alternative way to define inputs (via type hints) and
    outputs (via the `outputs_def` class attribute).
    """
    outputs: OutputRegistry = None
    
    # ALTERADO: A anotação e o formato esperado mudaram.
    # Agora é um dicionário: {'output_name': {'type': int}}
    outputs_def: Dict[str, Dict[str, Any]] = {}

    def __init__(self, **kwargs):
        # A lógica de inputs permanece a mesma
        hints = {k: v for k, v in get_type_hints(self.__class__).items() if not k.startswith("_") and k not in ("outputs", "outputs_def")}
        defaults = {k: v for k, v in self.__class__.__dict__.items() if not k.startswith("_") and not callable(v) and k not in ("outputs", "outputs_def")}

        for name, type_ in hints.items():
            if name in kwargs:
                setattr(self, name, kwargs[name])
            elif name in defaults:
                setattr(self, name, defaults[name])
            else:
                raise ValueError(f"Missing required input: {name}")

        # A lógica de outputs é atualizada para o novo formato
        self.outputs = OutputRegistry()
        
        # 1. Processa `outputs_def` da classe base
        class_outputs = getattr(self.__class__, "outputs_def", {})
        print(class_outputs)
        for name, definition in class_outputs.items():
            self.outputs.add(name, definition.get('type', Any))

        # 2. Processa outputs de decoradores @Output (para permitir combinação de estilos)
        meta = getattr(self.__class__, "__nmg8_meta__", {})
        decorator_outputs = meta.get("outputs", {})
        for name, definition in decorator_outputs.items():
            self.outputs.add(name, definition.get("type", Any))
        
    def run(self):
        raise NotImplementedError("override run() or use @Run on a method")

# ---------- runtime ----------
class NMG8Runtime:
    _oo_registered = False
    _procedural_registered = False

    def __init__(self):
        self.main_output: Any = None
        self.inputs = InputRegistry()
        self.outputs = OutputRegistry()

    def set_stdout(self, data: Any):
        self.main_output = data

    @staticmethod
    def _read_inputs():
        if sys.stdin.isatty(): return {}
        raw = sys.stdin.read().strip()
        return json.loads(raw) if raw else {}

    # ALTERADO: Schema de outputs agora é mais rico
    def _format_outputs_for_schema(self, output_defs: Dict[str, Dict[str, Any]]) -> List[Dict[str, str]]:
        return [{"name": name, "type": type_to_str(d.get("type", Any))} for name, d in output_defs.items()]

    def _get_combined_proc_config(self, fn: callable) -> dict:
        meta = getattr(fn, "__nmg8_proc_meta__", {"inputs": {}, "outputs": {}})
        
        combined_inputs = self.inputs.fields.copy()
        combined_inputs.update(meta.get("inputs", {}))
        
        # ALTERADO: Combina dicionários, não sets
        combined_outputs = self.outputs.definitions.copy()
        combined_outputs.update(meta.get("outputs", {}))

        return {"inputs": combined_inputs, "outputs": combined_outputs}

    def _schema_for_function(self, fn):
        config = self._get_combined_proc_config(fn)
        # ... (lógica de inputs não muda) ...
        fields = []
        processed_names = set()
        sig = inspect.signature(fn)
        for name, param in sig.parameters.items():
            if name == "self": continue
            input_def = config["inputs"].get(name, {})
            required = param.default is inspect._empty
            if name in config["inputs"]: required = config["inputs"][name].get("required", required)
            type_str = type_to_str(param.annotation) if param.annotation is not inspect._empty else type_to_str(input_def.get("type", Any))
            fields.append({"name": name, "type": type_str, "required": required})
            processed_names.add(name)
        for name, definition in config["inputs"].items():
            if name not in processed_names:
                fields.append({"name": name, "type": type_to_str(definition.get("type", Any)), "required": definition.get("required", False)})

        # ALTERADO: Formatação do schema de outputs
        output_schema = self._format_outputs_for_schema(config["outputs"])
        return {"inputs": fields, "outputs": output_schema}

    def _schema_for_class(self, clazz):
        meta = ensure_meta(clazz)
        # ... (lógica de inputs não muda) ...
        hints = get_type_hints(clazz, include_extras=True)
        fields = []
        class_defaults = {k: v for k, v in clazz.__dict__.items() if not k.startswith("_")}
        for name, typ in hints.items():
            if name in ("outputs", "outputs_def"): continue
            required = name not in class_defaults
            if "inputs" in meta and name in meta["inputs"]:
                required = meta["inputs"][name].get("required", required)
                typ = meta["inputs"][name].get("type", typ)
            fields.append({"name": name, "type": type_to_str(typ), "required": required})
        if "inputs" in meta:
            for k, v in meta["inputs"].items():
                if k not in [f["name"] for f in fields]:
                    fields.append({"name": k, "type": type_to_str(v.get("type", str)), "required": v.get("required", False)})
        
        # ALTERADO: Combina e formata outputs para o schema
        combined_outputs = self.outputs.definitions.copy()
        combined_outputs.update(meta.get("outputs", {}))
        
        class_outputs_def = getattr(clazz, "outputs_def", {}) # Default to dict

        if isinstance(class_outputs_def, dict): # Novo formato rico
            for name, definition in class_outputs_def.items():
                if name not in combined_outputs:
                    # CORREÇÃO: Usamos o tipo da definição!
                    combined_outputs[name] = {
                        'name': name, 
                        'type': definition.get("type", Any)
                    }
        elif isinstance(class_outputs_def, list): # Compatibilidade com lista de strings
            for o_name in class_outputs_def:
                if o_name not in combined_outputs:
                    combined_outputs[o_name] = {'name': o_name, 'type': Any}

        output_schema = self._format_outputs_for_schema(combined_outputs)
        
        return {"inputs": fields, "outputs": output_schema}

    def _run_function(self, fn):
        config = self._get_combined_proc_config(fn)
        self.outputs = OutputRegistry() # Reseta para a execução
        for name, definition in config["outputs"].items():
            self.outputs.add(name, definition.get("type", Any))
        
        # ... (lógica de construção de args não muda) ...
        inputs_data = self._read_inputs()
        args = {}
        sig = inspect.signature(fn)
        for name, param in sig.parameters.items():
            if name == "self": continue
            if name in inputs_data: args[name] = inputs_data[name]
            elif param.default is not inspect._empty: args[name] = param.default
            elif config["inputs"].get(name, {}).get("required", False):
                raise ValueError(f"Missing required input: {name}")
        for k, v in config["inputs"].items():
            if k not in sig.parameters and k in inputs_data:
                 args[k] = inputs_data[k]
        
        fn(**args) # Executa
        final = {"stdout": self.main_output, "stderr": None, "outputs": self.outputs.data}
        print(json.dumps(final, indent=2))
    
    def _process_output_methods(self, instance: Any):
        # ... (lógica interna não muda, apenas a verificação de `definitions`) ...
        main_out_found = False
        processed_outputs = set()
        for name, member in inspect.getmembers(instance, predicate=inspect.ismethod):
            if hasattr(member, '__nmg8_is_main_out__'):
                if main_out_found: raise TypeError(f"Multiple @MainOut methods in {instance.__class__.__name__}.")
                main_out_found = True
                self.set_stdout(member())
            if hasattr(member, '__nmg8_output_name__'):
                output_name = getattr(member, '__nmg8_output_name__')
                if output_name in processed_outputs: raise TypeError(f"Multiple @Out methods for '{output_name}'.")
                processed_outputs.add(output_name)
                # ALTERADO: a verificação agora é em um dicionário
                if output_name not in instance.outputs.definitions:
                    raise NameError(f"Output '{output_name}' was not declared. Add @Output('{output_name}') to the class.")
                instance.outputs.set_data(output_name, member())

    def _run_class(self, clazz):
        if getattr(clazz, "__nmg8_is_node__", False) and self._procedural_registered:
            raise RuntimeError("Cannot mix OO and procedural modes.")
        self.__class__._oo_registered = True
        
        inputs = self._read_inputs()
        instance = clazz(**inputs)
        
        run_method_name = getattr(clazz, "__nmg8_meta__", {}).get('run_method')
        run_fn = None
        if run_method_name: run_fn = getattr(instance, run_method_name, None)
        elif hasattr(instance, "run"): run_fn = instance.run
        if not run_fn or not callable(run_fn):
            raise RuntimeError(f"Class '{clazz.__name__}' has no execution method.")

        run_fn()
        self._process_output_methods(instance)

        final = {"stdout": self.main_output, "stderr": None, "outputs": instance.outputs.data}
        print(json.dumps(final, indent=2))

    # ALTERADO: public run agora tem tratamento de erro
    def run(self, target):
        try:
            if "--schema" in sys.argv:
                procedural = inspect.isfunction(target)
                schema = self._schema_for_function(target) if procedural else self._schema_for_class(target)
                print(json.dumps({"schema": schema}, indent=2))
                return

            if inspect.isfunction(target):
                self._run_function(target)
            else:
                self._run_class(target)
        except Exception as e:
            # Captura qualquer exceção, formata a saída de erro e encerra
            err_info = {
                "type": e.__class__.__name__,
                "message": str(e),
                "traceback": traceback.format_exc()
            }
            error_output = {"stdout": None, "stderr": err_info, "outputs": {}}
            print(json.dumps(error_output, indent=2))
            sys.exit(1) # Sinaliza erro para o sistema operacional

# global instance
nmg8py = NMG8Runtime()
set_stdout = nmg8py.set_stdout
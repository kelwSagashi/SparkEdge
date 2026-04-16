# 📦 NMG8 Runtime SDK


Um runtime leve para execução de scripts Python para o nmg8 com:

* 🧠 Geração automática de schema
* 🖥️ CLI profissional (flags, help, validação)
* 🔄 Compatível com stdin/stdout (modo pipeline)
* ⚡ Execução de funções ou classes

---

# 🚀 Instalação

```bash
git clone https://github.com/kelwp/nmg8pySDK
cd nmg8pySDK
```

Ou apenas copie a pasta `nmg8pySDK` para a raiz do seu projeto.

---

# ⚡ Uso rápido

## 🔹 Exemplo com classe

```python
from nmg8pySDK import nmg8py

class SampleMonitor(NodeBase):
    ip: str
    device_id: str | None = None

    outputs_def = {
        'meta': {'type': dict[str, str]}, 
        'main': {'type': dict[str, int]}
    }

    def run(self):
        self.outputs.set_data("main", {"msg": "OK"})
        nmg8py.set_stdout({"teste": 1})
        self.outputs.set_data("meta", {"status": 1})

if __name__ == "__main__":
    nmg8py.run(SampleMonitor)
```

---

## 🔹 Executando via CLI

```bash
python script.py --ip 192.168.0.1
```

---

## 🔹 Saída

```json
{
  "stdout": {
    "status": "ok",
    "ip": "192.168.0.1"
  },
  "stderr": null
}
```

---

# 🧠 Modos de entrada

## 1. Flags (CLI moderna)

```bash
python script.py --ip 123
```

---

## 2. JSON inline

```bash
python script.py --input '{"ip":"123"}'
```

---

## 3. Arquivo JSON

```bash
python script.py --input-file data.json
```

---

## 4. stdin (modo pipeline)

```bash
echo '{"ip":"123"}' | python script.py
```

👉 Ideal para integração com automações e orquestradores.

---

# 📖 Help automático

```bash
python script.py --help
```

Exemplo:

```
NMG8 Script CLI

Inputs:
  --ip (string, required)

Other options:
  --input '<json>'
  --input-file <file>
  --schema
  --help

Outputs:
  status (string)
  ip (string)
```

---

# 🧬 Schema automático

```bash
python script.py --schema
```

Saída:

```json
{
  "schema": {
    "inputs": [
      {"name": "ip", "type": "string", "required": true}
    ],
    "outputs": [
      {"name": "status", "type": "string"},
      {"name": "ip", "type": "string"}
    ]
  }
}
```

---

# ⚙️ Tipos suportados

| Tipo    | Exemplo CLI        | Resultado   |
| ------- | ------------------ | ----------- |
| string  | `--name John`      | `"John"`    |
| number  | `--age 25`         | `25`        |
| boolean | `--active true`    | `true`      |
| array   | `--tags '[1,2,3]'` | `[1,2,3]`   |
| json    | `--data '{"a":1}'` | `{ "a":1 }` |

---

# 🧪 Execução com função

```python
from runtime import NMG8Runtime

def handler(ip: str):
    return {"status": "ok", "ip": ip}

if __name__ == "__main__":
    NMG8Runtime().run(handler)
```

---

# 🔁 Estrutura de saída

Todo script retorna:

```json
{
  "stdout": {...},
  "stderr": null
}
```

Ou em caso de erro:

```json
{
  "stdout": null,
  "stderr": {
    "type": "ValueError",
    "message": "Missing required input: ip",
    "traceback": "..."
  }
}
```

---

# 🧩 Integração com NMG8

Esse runtime foi projetado para funcionar diretamente em pipelines:

* Recebe JSON via stdin
* Retorna JSON estruturado
* Possui schema introspectivo

👉 Ideal para:

* automações
* workflows
* agentes
* execução remota

---

# 🏗️ Arquitetura

* `NMG8Runtime`

  * parsing CLI
  * leitura de inputs
  * execução
  * geração de schema
  * tratamento de erro

---

# 🔒 Validações

* Campos obrigatórios (`required`)
* Tipagem automática
* Erros estruturados
* Argumentos desconhecidos são rejeitados

---

# 💡 Filosofia

Esse SDK segue 3 princípios:

1. **Zero boilerplate**
2. **CLI primeiro**
3. **Compatível com pipelines**

---

# 🚀 Roadmap

* [ ] Autocomplete (bash/zsh)
* [ ] Logs coloridos
* [ ] Plugins
* [ ] Execução assíncrona
* [ ] Cache de execução

---

# 🤝 Contribuição

Pull requests são bem-vindos!

---

# 📄 Licença

MIT

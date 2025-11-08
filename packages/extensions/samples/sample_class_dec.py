# meu_node_declarativo.py
from nmg8py import Node, Input, Output, Run, MainOut, Out, nmg8py
import requests

@Node
@Input(name="host", required=True, type=str)
@Output(name="status_code", type=int)
@Output(name="content_type", type=str)
class StatusReporter:
    host: str
    protocol: str = "https"
    
    # Atributos para guardar o estado após a execução
    _response: requests.Response | None = None
    _error: str | None = None

    @Run
    def fetch_status(self):
        """
        Método principal. Apenas faz o trabalho e guarda o estado.
        Não se preocupa em formatar a saída.
        """
        url = f"{self.protocol}://{self.host}"
        try:
            self._response = requests.get(url, timeout=5)
            self._response.raise_for_status() # Lança exceção para códigos de erro (4xx, 5xx)
        except requests.RequestException as e:
            self._error = str(e)

    # --- Métodos de Saída ---

    @MainOut
    def get_main_output(self) -> dict:
        """O retorno daqui será o 'stdout' do JSON final."""
        if self._error:
            return {"host": self.host, "status": "error", "message": self._error}
        if self._response:
            return {"host": self.host, "status": "success", "code": self._response.status_code}
        return {"host": self.host, "status": "unknown"}

    @Out("status_code")
    def get_status_code(self) -> int:
        """O retorno daqui será a saída 'status_code'."""
        return self._response.status_code if self._response else -1
        
    @Out("content_type")
    def get_content_type(self) -> str | None:
        """O retorno daqui será a saída 'content_type'."""
        if self._response:
            return self._response.headers.get('Content-Type')
        return None


if __name__ == "__main__":
    nmg8py.run(StatusReporter)
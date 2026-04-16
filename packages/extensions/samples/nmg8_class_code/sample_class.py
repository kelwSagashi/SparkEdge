from nmg8pySDK import NodeBase, nmg8py

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
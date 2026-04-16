# sample_proc.py
from nmg8pySDK import nmg8py, Input, Output, Run

@Input("ip", required=True, type=str)
@Input("device_id", required=False, type=str)
@Output("meta")
@Run
def main(ip, device_id=None):
    import json
    nmg8py.set_stdout({"msg":"OK", "ip": ip, "id": device_id})
    nmg8py.outputs.set_data("meta", {"info": 123})

if __name__ == "__main__":
    nmg8py.run(main)
from nmg8py import nmg8py

def run(ip, device_id):
    nmg8py.set_stdout({"msg": "OK", "ip": ip, "id": device_id})
    nmg8py.outputs.set_data("meta", {"info": 123})

nmg8py.outputs.add("meta")
nmg8py.inputs.add('ip', required=True)
nmg8py.inputs.add('device_id')

nmg8py.run(run)
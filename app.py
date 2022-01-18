from flask import Flask, request, jsonify
import base64
import sys
import random
import string
import json
BASE_ADR = "../"
app = Flask(__name__)

@app.route('/scc_server_receive/', methods=['GET', 'POST'])
def scc_server_receive():
    name = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8))
    content = json.loads(request.data)
    print(content, file=sys.stderr)
    with open(BASE_ADR + "/image_dataset/image_" + str(content["image_id"]) + "_" + name + ".png", "wb") as fh:
        imgdata = base64.b64decode(content["image"].split(",")[1])
        fh.write(imgdata)
    with open(BASE_ADR + "/image_dataset/data_" + str(content["image_id"]) + "_" + name + ".json", "w") as file:
        del content["image"]
        json.dump(content, file)

    return {"status": 200}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
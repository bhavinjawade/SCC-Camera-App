from flask import Flask, request, jsonify
import base64
import sys
import json
BASE_ADR = "../"
app = Flask(__name__)

@app.route('/scc_server_receive/', methods=['GET', 'POST'])
def scc_server_receive():
    content = json.loads(request.data)
    print(content, file=sys.stderr)
    with open(BASE_ADR + "/image_dataset/" + content["image_id"] + ".png", "wb") as fh:
        fh.write(base64.decodebytes(content["image"]))    
    return {"status": 200}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=105)
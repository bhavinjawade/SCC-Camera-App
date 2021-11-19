from flask import Flask, request, jsonify
import base64
import sys

BASE_ADR = "../"
app = Flask(__name__)

@app.route('/scc_server_receive/', methods=['GET', 'POST'])
def scc_server_receive():
    content = request.form
    print(content, file=sys.stderr)
    for filename, b64 in content.items():
        with open(BASE_ADR + "/image_dataset/" + filename + ".png", "wb") as fh:
            print(b64)
            fh.write(base64.decodebytes(b64))    
    return {"status": 200}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=105)
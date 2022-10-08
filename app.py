from flask import Flask, request, jsonify
import base64
import sys
import random
import string
import json
import numpy as np
import sys, random
import torch
from torchvision import models, transforms
from PIL import Image
from pathlib import Path
import matplotlib.pyplot as plt
import json

device = torch.device("cpu")


BASE_ADR = "../"
app = Flask(__name__)
MODEL='../model_swin.pth'# Load the model for testing
model = torch.load(MODEL, map_location=device)
model.eval()
f = open('./scraped_det_test.json')
test_annot_json = json.load(f)
categories = test_annot_json['categories']
index_to_name_map = {}

for each  in index_to_name_map:
    index_to_name_map[each['id']] = each['name']
    print (index_to_name_map)

preprocess = transforms.Compose([
    transforms.Resize(size=(224,224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                            [0.229, 0.224, 0.225])
])

@app.route('/model_infer/', methods=['GET', 'POST'])
def model_infer():
    print("TESTING ENTRY")
    name = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8))
    content = json.loads(request.data)    
    imgdata = base64.b64decode(content["image"].split(",")[1])
    print(imgdata)    
    # img=Image.open(imgname).convert('RGB')
    inputs=preprocess(imgdata).unsqueeze(0).to(device)
    outputs = torch.sigmoid(model(inputs))
    outputs = outputs.cpu().detach().numpy()
    print(outputs)
    preds = np.array(outputs > threshold, dtype=float)
    print(preds)
    preds = np.where(preds[0] == 1)
    preds = preds[0]
    if (len(preds) == 0):
        print("Retry")
        threshold = 0.1
        preds = np.array(outputs > threshold, dtype=float)
        preds = np.where(preds[0] == 1)
        preds = preds[0]    
        predicitions = []
    
    for each in preds:
        predicitions.append(index_to_name_map[each])    
        print (predicitions)
    return_dict = {name:predicitions}
    json_object_predictions = json.dumps(return_dict)    
    return {"value" : json_object_predictions, "status": 200}
    
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
    app.run(host='localhost', port=6709, ssl_context=("cert.pem", "key.pem"))